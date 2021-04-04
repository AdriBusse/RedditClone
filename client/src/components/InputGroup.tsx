import classNames from 'classNames';

interface InputGroupProps {
  className?: string;
  type: string;
  placeholder: string;
  value: string;
  error: string | undefined;
  setValue: (str: string) => void;
}
const InputGroup: React.FC<InputGroupProps> = ({
  className,
  type,
  placeholder,
  value,
  error,
  setValue,
}) => {
  return (
    <div className={className}>
      <input
        type={type}
        placeholder={placeholder}
        className={classNames(
          'w-full p-3 py-2 transition duration-200 border rounded outline-none focus:bg-white hover:bg-white bg-gray-50 border-grey-400',
          { 'border-red-500': error }
        )}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      ></input>
      <small className="font-medium text-red-600">{error}</small>
    </div>
  );
};

export default InputGroup;
