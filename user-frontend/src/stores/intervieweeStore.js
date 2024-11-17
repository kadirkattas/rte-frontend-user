import { create } from "zustand";
import axios from "axios";

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_API_URL;

// Zustand store'unu oluşturuyoruz
const useIntervieweeStore = create((set) => ({
  questionIds: [], // State for question IDs
  question: null, // State for a single question
  intervieweeId: "",
  setIntervieweeId: (id) => set({ intervieweeId: id }),
  time: [],
  setTime: async (time) => set({ time }),

  isActive: null, // Yeni bir durum ekleyin

  fetchInterviewQuestions: async (id) => {
    try {
      console.log("id: ", id);
      console.log("Url: ", import.meta.env.VITE_BACKEND_API_URL);
      const response = await axios.get(
        `/interview-room/get-interview-questions-with-url/${id}`,
        {
          withCredentials: true,
        }
      );
      console.log("Interview questions fetched:", response.data);
      set({ questionIds: response.data.questionIds }); // Save question IDs to state
    } catch (error) {
      console.error("Error fetching interview questions:", error);
    }
  },
  fetchQuestion: async (id) => {
    try {
      const response = await axios.get(
        `/interview-room/get-question-by-id/${id}`,
        {
          withCredentials: true,
        }
      );
      console.log("Question fetched:", response.data);
      set({ question: response.data.question }); // Save fetched question to state
    } catch (error) {
      console.error("Error fetching question:", error);
    }
  },
  isUploading: false, // Yeni bir durum ekleyin

  saveInterviewVideo: async (videoBlob, interviewUrl, time) => {
    set({ isUploading: true }); // Yükleme başladığında durumu güncelleyin
    try {
      const { intervieweeId } = useIntervieweeStore.getState();

      const formData = new FormData();
      formData.append("file", videoBlob, "interview-video.webm");
      formData.append("interviewUrl", interviewUrl);
      formData.append(
        "videos",
        JSON.stringify([
          {
            path: "",
            note: "",
            time,
            intervieweeId: intervieweeId,
            approved: false,
            rejected: false,
            new: true,
          },
        ])
      );

      const response = await axios.post(
        `/interview-room/upload-video`,
        formData,
        { withCredentials: true },
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Interview video saved:", response.data);
    } catch (error) {
      console.error("Error saving interview video:", error);
    } finally {
      set({ isUploading: false }); // Yükleme tamamlandıktan sonra durumu güncelleyin
    }
  },
  createUser: async (formData) => {
    try {
      const response = await axios.post(
        `/interview-room/create-personal-form`,
        formData,
        {
          withCredentials: true,
        }
      );
      console.log("User created:", response.data.id);
      return response.data.id;
    } catch (error) {
      console.error("Error creating user:", error);
    }
  },

  getInterviewStatus: async (interviewUrl) => {
    try {
      const response = await axios.get(
        `/interview-room/is-interview-active/${interviewUrl}`,
        {
          withCredentials: true,
        }
      );
      console.log("Interview status:", response.data.isActive);
      set({ isActive: response.data.isActive });
    } catch (error) {
      console.error("Error getting interview status:", error);
    }
  },
}));

export default useIntervieweeStore;
