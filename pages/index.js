import Head from 'next/head';
import Image from 'next/image';
import Chatbot from '../components/Chatbot';

export default function Home() {
  return (
    <div className="min-h-screen h-screen overflow-hidden bg-gradient-to-b from-blue-50 to-blue-100 flex flex-col justify-center items-center px-4 sm:px-0">
      <Head>
        <title>ISE Chatbot</title>
        <meta name="description" content="Assist" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="bg-white shadow-xl rounded-3xl overflow-hidden w-full max-w-full sm:max-w-2xl flex flex-col" style={{ height: '70vh' }}>
        <div className="relative">
          <Image
            src="/ai.webp"
            alt="ISE Cover"
            width={800}
            height={300}
            className="w-full h-32 sm:h-32 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-50"></div>
          <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 text-white text-lg sm:text-2xl font-bold">Assist</div>
        </div>

        <div className="flex-grow p-4 sm:p-6 overflow-hidden">
          <Chatbot />
        </div>
      </div>

     
    </div>
  );
}