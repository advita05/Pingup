import React, { useState, useEffect } from "react";
import { dummyPostsData } from "../assets/assets";
import Loading from "../components/Loading";
import Stories from "../components/Stories";
import PostCard from "../components/PostCard";
import { assets } from "../assets/assets";
import Recentmsg from "../components/Recentmsg";

const Feed = () => {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFeeds = async () => {
    setFeeds(dummyPostsData);
    setLoading(false);
  };

  useEffect(() => {
    fetchFeeds();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="h-full overflow-y-scroll no-scrollbar py-10 xl:pr-5 flex items-start justify-center xl:gap-8">
      <div className="flex flex-col">
        <Stories />
        <div className="p-4 space-y-6">
          {feeds.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      </div>
      <div className="max-xl:hidden sticky top-0">
        <div className="max-w-xs bg-white text-xs p-4 rounded-md inline-flex flex-col gap-2 shadow">
         <h3 className="text-slate-800 font-semibold ">Sponsored</h3>
         <img src={assets.sponsored_img} className="w-75 h-50 rounded-md" alt="" />
         <p className="text-slate-400"> Email marketing</p>
         <p className="text-slate-400">Boost your brand’s reach effortlessly—connect, engage, and grow with Spoonset today!</p>
        </div>
        <Recentmsg/>
      </div>
    </div>
  ) 
};

export default Feed;

