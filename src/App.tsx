import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Index from './view/index';
import Home from './view/home';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}
