import useIntervieweeStore from "../stores/intervieweeStore";
import VideoRecorder from "../components/videoRecorderModal";
import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import FormModal from "../components/userFormModal";

let totalElapsedTime = 0;

const IntervieweePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    questionIds,
    fetchInterviewQuestions,
    question,
    fetchQuestion,
    createUser,
    setIntervieweeId,
    setTime,
    isActive,
    getInterviewStatus,
  } = useIntervieweeStore();

  const totalQuestions = questionIds.length;
  const [isRecording, setIsRecording] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const videoRecorderRef = useRef(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);
  const [countdownStarted, setCountdownStarted] = useState(false);
  const [timeRecords, setTimeRecords] = useState([]);

  useEffect(() => {
    getInterviewStatus(id);
  }, [id, getInterviewStatus]);

  useEffect(() => {
    if (isActive !== null) {
      if (isActive === false) {
        navigate("/not-authorized");
      }
    }
  }, [isActive, navigate]);

  useEffect(() => {
    fetchInterviewQuestions(id);
  }, [fetchInterviewQuestions, id]);

  useEffect(() => {
    if (questionIds.length > 0) {
      fetchQuestion(questionIds[currentQuestionIndex]);
    }
  }, [fetchQuestion, questionIds, currentQuestionIndex]);

  useEffect(() => {
    if (question) {
      setRemainingTime(question.time * 60);
    }
  }, [question]);

  useEffect(() => {
    if (remainingTime > 0 && countdownStarted) {
      const timer = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleNextQuestion();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [remainingTime, countdownStarted]);

  const handleNextQuestion = () => {
    if (isRecording && currentQuestionIndex < questionIds.length - 1) {
      const currentTime = question.time * 60 - remainingTime;
      totalElapsedTime += currentTime;
      setTimeRecords((prevRecords) => [
        ...prevRecords,
        {
          questionNumber: currentQuestionIndex + 1,
          minutes: formatSetTime(totalElapsedTime / 60),
        },
      ]);

      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      setRemainingTime(questionIds[currentQuestionIndex + 1].time * 60);
      setCountdownStarted(false);
      setIsRecording(true);
      setCountdownStarted(true);
    }
  };

  const requestPermissions = async () => {
    const permission = await videoRecorderRef.current.getCameraPermission();
    setPermissionGranted(permission);
  };

  const handleStartRecording = async () => {
    if (!isRecording) {
      setIsRecording(true);
      setCountdownStarted(true);
      videoRecorderRef.current.startRecording();
    } else if (currentQuestionIndex === totalQuestions - 1) {
      handleStopRecording();
    }
  };

  const handleStopRecording = async () => {
    const finalTime = question.time * 60 - remainingTime;
    totalElapsedTime += finalTime;

    const finalRecord = {
      questionNumber: currentQuestionIndex + 1,
      minutes: formatSetTime(totalElapsedTime / 60),
    };

    setTimeRecords((prevRecords) => [...prevRecords, finalRecord]);
    setIsRecording(false);
    videoRecorderRef.current.stopRecording();
    setCountdownStarted(false);

    const updatedTimeRecords = [...timeRecords, finalRecord];
    await setTime(updatedTimeRecords);
  };

  const formatSetTime = (minutes) => {
    const mins = Math.floor(minutes);
    const secs = Math.round((minutes - mins) * 60);
    return `${mins} minutes ${secs} seconds`;
  };

  const formatTime = (timeInSeconds) => {
    const minutes = String(Math.floor(timeInSeconds / 60)).padStart(2, "0");
    const seconds = String(timeInSeconds % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  useEffect(() => {
    requestPermissions();
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(true);
  const handleFormSubmit = async (formData) => {
    const newIntervieweeId = await createUser(formData);
    setIntervieweeId(newIntervieweeId);
    setIsModalOpen(false);
  };

  return (
    <div className="w-full h-screen flex flex-col md:flex-row">
      <FormModal isOpen={isModalOpen} onSubmit={handleFormSubmit} />

      {/* Soru ve Buton Alanı (Masaüstü) */}
      <div className="relative w-full h-screen bg-black text-white">
        {/* Kamera */}
        <VideoRecorder
          ref={videoRecorderRef}
          className="w-full h-full object-cover"
        />

        {/* Sol üst köşede soru numarası */}
        <div className="absolute top-4 left-4 bg-gray-900 bg-opacity-70 px-4 py-2 rounded-lg shadow">
          <span className="text-sm font-bold">
            Question {currentQuestionIndex + 1}/{totalQuestions}
          </span>
        </div>

        {/* Sağ üst köşede süre */}
        <div className="absolute top-4 right-4 bg-gray-900 bg-opacity-70 px-4 py-2 rounded-lg shadow">
          <span className="text-lg font-bold">{formatTime(remainingTime)}</span>
        </div>

        {/* Soru ve buton alanı */}
        <div className="absolute bottom-16 w-full px-6 flex flex-col items-center space-y-4">
          <h1 className="text-center text-lg font-semibold bg-gray-900 bg-opacity-70 p-4 rounded-lg max-w-4xl max-h-24 overflow-y-auto scrollbar-hide break-words">
            {question ? question.question : "Loading question..."}
          </h1>
          <button
            onClick={() => {
              if (currentQuestionIndex === totalQuestions - 1 && isRecording) {
                handleStopRecording();
              } else if (!isRecording) {
                handleStartRecording();
              } else {
                handleNextQuestion();
              }
            }}
            className={`px-8 py-4 rounded-full text-lg font-bold transition-all ${
              permissionGranted
                ? "bg-green-500 hover:bg-green-600"
                : "bg-gray-500 cursor-not-allowed"
            }`}
            disabled={!permissionGranted}
          >
            {isRecording
              ? currentQuestionIndex === totalQuestions - 1
                ? "Stop"
                : "Next"
              : "Start"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IntervieweePage;
