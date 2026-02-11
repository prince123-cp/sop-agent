import SourceBox from './SourceBox';

const Message = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`mx-auto mb-5 flex w-full max-w-4xl ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`w-fit max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-7 shadow-sm md:max-w-[80%] ${
          isUser
            ? 'bg-gradient-to-r from-slate-900 to-slate-700 text-white'
            : 'border border-slate-200 bg-white text-slate-900'
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{message.text}</p>
        {!isUser && <SourceBox sources={message.sources} />}
      </div>
    </div>
  );
};

export default Message;
