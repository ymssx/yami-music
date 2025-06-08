import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './view/header';
import Index from './view/index';
import Home from './view/home';
import Search from './view/search';
import Ablums from './view/ablums';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/home" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/ablums" element={<Ablums />} />
      </Routes>
    </BrowserRouter>
  );
}
