import Navbar from "../components/Navbar";
import MailImg from "../../imgs/mail.png";

const Templates = () => {
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-20 h-full py-20 px-26">
          {/* Template Card 1 */}
          <div className="bg-white rounded-lg shadow-md py-6 px-20 flex flex-col items-center justify-center text-center">
            <div className="mb-4">
              <img src={MailImg} alt="mail-image" />
            </div>
            <p className="text-gray-700 font-medium">
              360 Feedback Plan with few competencies
            </p>
          </div>

          {/* Template Card 2 */}
          <div className="bg-white rounded-lg shadow-md py-6 px-20 flex flex-col items-center justify-center text-center">
            <div className="mb-4">
              <img src={MailImg} alt="mail-image" />
            </div>
            <p className="text-gray-700 font-medium">
              360 Feedback with two competencies
            </p>
          </div>

          {/* Template Card 3 */}
          <div className="bg-white rounded-lg shadow-md py-6 px-20 flex flex-col items-center justify-center text-center">
            <div className="mb-4">
              <img src={MailImg} alt="mail-image" />
            </div>
            <p className="text-gray-700 font-medium">
              360 Feedback with ten competencies
            </p>
          </div>

          {/* Template Card 4 */}
          <div className="bg-white rounded-lg shadow-md py-6 px-20 flex flex-col items-center justify-center text-center">
            <div className="mb-4">
              <img src={MailImg} alt="mail-image" />
            </div>
            <p className="text-gray-700 font-medium">
              360 Feedback with two competencies
            </p>
          </div>

          {/* Template Card 5 */}
          <div className="bg-white rounded-lg shadow-md py-6 px-20 flex flex-col items-center justify-center text-center">
            <div className="mb-4">
              <img src={MailImg} alt="mail-image" />
            </div>
            <p className="text-gray-700 font-medium">
              360 Feedback with ten competencies
            </p>
          </div>

          {/* Template Card 6 */}
          <div className="bg-white rounded-lg shadow-md py-6 px-20 flex flex-col items-center justify-center text-center">
            <div className="mb-4">
              <img src={MailImg} alt="mail-image" />
            </div>
            <p className="text-gray-700 font-medium">
              360 Feedback Plan with few competencies
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Templates;
