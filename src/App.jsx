import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Feed from "./pages/Feed";
import Chat from "./pages/Chat";
import Connections from "./pages/Connections";
import Discover from "./pages/Discover";
import Profile from "./pages/Profile";
import Create from "./pages/Create";
import Layout from "./pages/Layout"; 
import {useUser} from '@clerk/clerk-react'

const App = () => {
  const {user} = useUser();
  return (
    <Routes>
      <Route path="/" element={!user ? <Login /> : <Layout/>}>
        <Route index element={<Feed />} />
        <Route path="Msgs" element={<Feed />} />
        <Route path="Msgs/:userId" element={<Chat />} />
        <Route path="Connections" element={<Connections />} />
        <Route path="Discover" element={<Discover />} />
        <Route path="Profile" element={<Profile />} />
        <Route path="Profile/:profileId" element={<Profile />} />
        <Route path="Create" element={<Create />} />
      </Route>
    </Routes>
  );
};

export default App;
