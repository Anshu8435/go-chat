import React from "react";
import { useNavigate } from "react-router-dom";
import Heroimage from "../assets/heroimg.webp";
import { motion } from "motion/react";

const Herosection = () => {
  const navigate = useNavigate();
  return (
    <>
      <div className="mt-9">
        <div className="m-8 ms-10">
          <img src={Heroimage} className="relative" alt="image" />
        </div>

        <div className="absolute top-60">
          <motion.p
            initial={{ x: "-150vw", opacity: 0 }}
            animate={{ x: "6vw", opacity: 1 }}
            transition={{ duration: 2, ease: "easeIn" }}
            className="text-8xl font-bold text-white ms-12"
          >
            Message <br /> privately
          </motion.p>
          <br />
          <motion.button
            initial={{ x: "100vw", opacity: 0 }}
            animate={{ x: "80vw", opacity: 1 }}
            transition={{ duration: 2, ease: "easeIn" }}
            className="rounded-xl bg-white px-6 py-3 text-emerald-400 font-medium cursor-pointer hover:bg-emerald-50 transition"
            onClick={() => navigate("/chatPage")}
          >
            Go to Chat
          </motion.button>
          <motion.p
            initial={{ x: "-100vw", opacity: 0 }}
            animate={{ x: "1vw", opacity: 1 }}
            transition={{ duration: 2, ease: "easeIn" }}
            className="text-2xl mt-4 ms-12 text-white"
          >
            Simple, reliable, private messaging and <br /> calling for free*,
            available all over the <br /> world.
          </motion.p>

          <motion.button
            initial={{ x: "100vw", opacity: 0 }}
            animate={{ x: "80vw", opacity: 1 }}
            transition={{ duration: 2, ease: "easeIn" }}
            className="rounded-xl bg-white px-6 py-3 text-emerald-400 font-medium cursor-pointer hover:bg-emerald-50 transition"
            onClick={() => navigate("/register")}
          >
            Get Started
          </motion.button>
        </div>
      </div>
    </>
  );
};

export default Herosection;

