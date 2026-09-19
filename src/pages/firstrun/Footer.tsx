import Button from '@/components/Input/Button';
import { useRunActionMutation } from '@/core/react-query/action/mutations';
import useNavigateVoid from '@/hooks/useNavigateVoid';

type Props = {
  nextPage?: string;
  prevDisabled?: boolean;
  nextDisabled?: boolean;
  isFetching?: boolean;
  finish?: boolean;
  saveFunction?: () => void;
};

const Footer = (props: Props) => {
  const navigate = useNavigateVoid();

  const { mutate: runAction } = useRunActionMutation();

  const handleNext = () => {
    const { nextPage, saveFunction } = props;
    if (saveFunction) saveFunction();
    if (nextPage) navigate(`../${nextPage}`);
  };

  const handleFinish = () => {
    runAction('RunImport');
    navigate('/webui/dashboard', { replace: true, state: { firstRun: true } });
  };

  const {
    finish,
    isFetching,
    nextDisabled,
    prevDisabled,
  } = props;

  return (
    <div className="flex justify-between text-lg font-semibold">
      <Button onClick={() => navigate(-1)} buttonType="primary" className="w-1/2 py-2" disabled={prevDisabled}>
        Back
      </Button>
      {finish
        ? (
          <Button
            onClick={handleFinish}
            buttonType="primary"
            className="w-1/2 px-4 py-2"
            disabled={nextDisabled}
          >
            Finish
          </Button>
        )
        : (
          <Button
            onClick={() => handleNext()}
            buttonType="primary"
            className="w-1/2 px-4 py-2"
            disabled={nextDisabled || isFetching}
            loading={isFetching}
          >
            Next
          </Button>
        )}
    </div>
  );
};

export default Footer;
