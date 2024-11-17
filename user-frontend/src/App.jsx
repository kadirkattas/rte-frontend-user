import React from "react";
import { Routes, Route } from "react-router-dom";
import IntervieweePage from "./pages/interviewee.page";
import NotFoundPage from "./components/404Page";

const App = () => {
  return (
    <Routes>
      <Route path="/:id" element={<IntervieweePage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;
