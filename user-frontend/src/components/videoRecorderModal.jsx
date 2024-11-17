import {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import useIntervieweeStore from "../stores/intervieweeStore";
import { useParams } from "react-router-dom";

const VideoRecorder = forwardRef(({ isRecording }, ref) => {
  const mimeType = "video/webm";
  const [permission, setPermission] = useState(false);
  const mediaRecorder = useRef(null);
  const liveVideoFeed = useRef(null);
  const [stream, setStream] = useState(null);
  const [videoChunks, setVideoChunks] = useState([]);
  const [uploadComplete, setUploadComplete] = useState(false);

  const { saveInterviewVideo, isUploading } = useIntervieweeStore();
  const { id } = useParams();

  useImperativeHandle(ref, () => ({
    getCameraPermission: async () => {
      if ("MediaRecorder" in window) {
        try {
          const videoConstraints = { video: true };
          const audioConstraints = { audio: true };

          const audioStream = await navigator.mediaDevices.getUserMedia(
            audioConstraints
          );
          const videoStream = await navigator.mediaDevices.getUserMedia(
            videoConstraints
          );

          setPermission(true);

          const combinedStream = new MediaStream([
            ...videoStream.getVideoTracks(),
            ...audioStream.getAudioTracks(),
          ]);
          setStream(combinedStream);
          return true;
        } catch (err) {
          alert(err.message);
          return false;
        }
      } else {
        alert("The MediaRecorder API is not supported in your browser.");
        return false;
      }
    },

    startRecording: () => {
      mediaRecorder.current = new MediaRecorder(stream, { mimeType });
      mediaRecorder.current.start();
      let localVideoChunks = [];
      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          localVideoChunks.push(event.data);
        }
      };
      mediaRecorder.current.onstop = async () => {
        const videoBlob = new Blob(localVideoChunks, { type: mimeType });
        setVideoChunks([]); // Reset video chunks
        const { time } = useIntervieweeStore.getState(); // time değerini doğrudan store'dan alıyoruz
        console.log("Zaman kayıtları (stopRecording): ", time);
        await saveInterviewVideo(videoBlob, id, time); // Save video to the backend
        setUploadComplete(true); // Yükleme tamamlandığında durum güncelle
      };
      setVideoChunks(localVideoChunks);
    },

    stopRecording: () => {
      mediaRecorder.current.stop();
    },
  }));

  useEffect(() => {
    if (permission && liveVideoFeed.current && stream) {
      liveVideoFeed.current.srcObject = stream;
      liveVideoFeed.current.muted = true;
    }
  }, [permission, stream]);

  return (
    <div className="relative w-full h-full md:h-screen">
      <video
        ref={liveVideoFeed}
        className="absolute inset-0 w-full h-full object-cover" // Kamera ekranı tam dolduruyor
        autoPlay
      ></video>

      {/* Loading veya Başarı Pop-up */}
      {(isUploading || uploadComplete) && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-xs w-full text-center">
            {uploadComplete ? (
              <p className="text-lg font-semibold text-black">
                Mülakatınız tamamlanmıştır. Sekmeyi kapatabilirsiniz.
              </p>
            ) : (
              <>
                <p className="text-lg font-semibold text-black">
                  Video yükleniyor...
                </p>
                <div className="mt-4 loader w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

export default VideoRecorder;
