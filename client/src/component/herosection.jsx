import React from "react";
import Heroimage from "../assets/heroimg.webp";
import { motion } from "motion/react";

const herosection = () => {
  return (
    <>
      <div className="mt-9 ">
        <div className="m-8 ms-10 ">
          <img src={Heroimage} className="relative " alt="image" />
        </div>

        <div className=" absolute  top-60">
          <motion.p
            initial={{ x: "-150vw", opacity: 0 }}
            animate={{ x: "6vw", opacity: 25 }}
            transition={{ duration: 2, ease: "easein" }}
            className="text-7xl text-white ms-12"
          >
            Message <br /> privately
          </motion.p>
          <br />

          <motion.p
            initial={{ x: "-100vw", opacity: 0 }}
            animate={{ x: "1vw", opacity: 25 }}
            transition={{ duration: 2, ease: "easein" }}
            className="text-2xl  top-8/12 ms-30 text-white"
          >
            Simple, reliable, private messaging and <br /> calling for free*,
            available all over the <br /> world.
          </motion.p>

          <motion.button
            initial={{ x: "100vw", opacity: 0 }}
            animate={{ x: "80vw", opacity: 25 }}
            transition={{ duration: 2, ease: "easein" }}
            className="rounded-xl bg-white px-6 py-3 text-emerald-400 font-medium"
          >
            Get Started
          </motion.button>
        </div>
      </div>
    </>
  );
};

export default herosection;
