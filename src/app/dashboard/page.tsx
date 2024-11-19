'use client'
import DashboardPage from "@/components/Dashboard";

export default function DashboardPageWithStyles() {
  return (
    <>
      <DashboardPage />
      <style jsx global>{`
        .e-card {
          background: transparent;
          box-shadow: 0px 8px 28px -9px rgba(0,0,0,0.45);
          position: relative;
          overflow: hidden;
          border-radius: 16px;
        }

        .wave {
          position: absolute;
          width: 540px;
          height: 700px;
          opacity: 0.6;
          left: 0;
          top: 0;
          margin-left: -50%;
          margin-top: -70%;
        }

        .icon-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          height: 60px;
        }

        .icon {
          width: 3em;
          height: 3em;
        }

        .infotop {
          text-align: center;
          font-size: 20px;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: rgb(255, 255, 255);
          font-weight: 600;
          width: 100%;
        }

        .title {
          font-size: 16px;
          margin-top: 10px;
        }

        .value {
          font-size: 24px;
          font-weight: bold;
          margin-top: 5px;
        }

        .progress-wrapper {
          width: 80%;
          margin: 10px auto 0;
        }

        .progress {
          height: 8px;
          background-color: rgba(255, 255, 255, 0.3);
        }

        .progress::-webkit-progress-bar {
          background-color: rgba(255, 255, 255, 0.3);
        }

        .progress::-webkit-progress-value {
          background-color: white;
        }

        .progress::-moz-progress-bar {
          background-color: white;
        }

        .wave:nth-child(2),
        .wave:nth-child(3) {
          top: 210px;
        }

        .playing .wave {
          border-radius: 40%;
          animation: wave 3000ms infinite linear;
        }

        .wave {
          border-radius: 40%;
          animation: wave 55s infinite linear;
        }

        .playing .wave:nth-child(2) {
          animation-duration: 4000ms;
        }

        .wave:nth-child(2) {
          animation-duration: 50s;
        }

        .playing .wave:nth-child(3) {
          animation-duration: 5000ms;
        }

        .wave:nth-child(3) {
          animation-duration: 45s;
        }

        @keyframes wave {
          0% {
            transform: rotate(0deg);
          }

          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  )
}