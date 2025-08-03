import { useState } from 'react';

import questions from './questions.json';
import { MainHeader } from '@components/home/main-header';
import router from 'next/router';
import { SEO } from '@components/common/seo';
import Confetti from 'react-confetti';

import {
  FacebookShareButton,
  FacebookIcon,
  PinterestShareButton,
  PinterestIcon,
  RedditShareButton,
  RedditIcon,
  WhatsappShareButton,
  WhatsappIcon,
  LinkedinShareButton,
  LinkedinIcon
} from 'next-share';
import { PublicLayout } from '@components/layout/pub_layout';

const Quiz: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const currentQuestion: Question = questions[currentQuestionIndex];

  const handleBack = async (): Promise<void> => {
    try {
      await router.push('/');
    } catch (error) {
      //// console.error(
      //'An error occurred while navigating to the homepage:',
      //error
      //);
    }
  };

  type Question = {
    question: string;
    answers: string[];
    correctAnswer: string;
  };

  const handleAnswer = (answer: string) => {
    const isCorrect =
      answer.trim() === currentQuestion.correctAnswer.toString().trim();
    setIsCorrect(isCorrect);
    setShowFeedback(true);
    if (isCorrect) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    setShowFeedback(false);
    const nextQuestionIndex = currentQuestionIndex + 1;
    if (nextQuestionIndex < questions.length) {
      setCurrentQuestionIndex(nextQuestionIndex);
    } else {
      setShowSummary(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowSummary(false);
  };

  const renderScore = () => {
    return (
      <div className='mb-8 text-3xl font-bold'>
        <p className='mb-4'>{`Your Score: ${score}/${questions.length}`}</p>
        {/* <button
          className='px-6 py-3 text-white bg-blue-500 rounded-md hover:bg-blue-600'
          onClick={resetQuiz}
        >
          Try Again
        </button> */}
      </div>
    );
  };

  const renderQuiz = () => {
    return (
      <div className='text-center'>
        <div className='mb-8'>
          <p className='pt-2 pb-2 text-3xl font-bold text-slate-500'>{`Question ${
            currentQuestionIndex + 1
          } of ${questions.length}`}</p>
          <p className='text-3xl font-bold'>{`Score: ${score}/${questions.length}`}</p>
        </div>
        <h2 className='mb-8 text-4xl font-bold'>{currentQuestion.question}</h2>
        <div className='mb-8 flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-8 sm:space-y-0'>
          {currentQuestion.answers.map((answer) => (
            <button
              key={answer}
              className={`rounded-md px-6 py-3 text-white ${
                showFeedback
                  ? answer === currentQuestion.correctAnswer.toString()
                    ? 'bg-green-500'
                    : 'bg-red-500'
                  : 'bg-blue-500 hover:bg-blue-600'
              } w-full sm:w-auto`}
              onClick={() => handleAnswer(answer)}
            >
              {answer}
            </button>
          ))}
        </div>
        {showFeedback && (
          <div className='mb-8 text-3xl font-bold'>
            {isCorrect ? (
              <div className='relative'>
                <p className='text-green-500'>Correct!</p>
                <Confetti width={500} height={500} recycle={false} />
              </div>
            ) : (
              <p className='text-red-500'>Incorrect</p>
            )}
            <button
              className={`ml-8 rounded-md px-6 py-3 text-white ${
                currentQuestionIndex === questions.length - 1
                  ? 'bg-slate-500 hover:bg-amber-600'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
              onClick={handleNextQuestion}
            >
              {currentQuestionIndex === questions.length - 1
                ? 'Finish Quiz'
                : 'Next Question'}
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderSummary = () => {
    return (
      <div className='text-center'>
        <div className='mb-8'>
          <p className='text-3xl font-bold'>{`Your final score is ${score}/${questions.length}`}</p>
        </div>
        <div className='mb-8 flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-8 sm:space-y-0'>
          <button
            className='rounded-md bg-blue-500 px-6 py-3 text-white hover:bg-blue-600'
            onClick={resetQuiz}
          >
            Try Again
          </button>
          <div className='flex justify-center space-x-4 bg-white p-8 shadow-lg'>
            <div className='flex flex-col items-center'>
              <FacebookShareButton
                url={'http://www.buzzwin.com/trivia'}
                quote={`My final score on the Succession Season 3 Quiz is ${score}/${questions.length}. Take the quiz now!`}
              >
                <FacebookIcon className='h-10 w-10' />
              </FacebookShareButton>
            </div>
            <div className='flex flex-col items-center'>
              <WhatsappShareButton
                url={'http://www.buzzwin.com/trivia'}
                title={`My final score on the Succession Season 3 Quiz is ${score}/${questions.length}. Take the quiz now!`}
              >
                <WhatsappIcon className='h-10 w-10' />
              </WhatsappShareButton>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <MainHeader
        useActionButton
        title='Trivia - What do you know about Succession-Season 3 ?'
        action={handleBack}
      />
      <PublicLayout
        title='Buzzwin.com - Trivia'
        description='Trivia - What do you know about Succession-Season 3 ?'
        ogImage='https://www.themoviedb.org/t/p/w130_and_h195_bestv2/zOFosA3Ew4xW9jsoWYU2ou16a5F.jpg'
      >
        <div className='mx-auto h-full max-w-3xl p-6'>
          <div className='flex h-full flex-col'>
            <div className='h-full rounded-md bg-white p-8 shadow-lg'>
              <div className='container mx-auto px-4 py-8'>
                {showSummary ? (
                  renderSummary()
                ) : (
                  <>
                    {/* {renderScore()} */}
                    {renderQuiz()}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </PublicLayout>
    </>
  );
};

export default Quiz;
