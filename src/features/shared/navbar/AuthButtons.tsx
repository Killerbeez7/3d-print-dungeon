import { Button } from "@/components";

interface AuthButtonsProps {
  onLoginClick: () => void;
  onSignUpClick: () => void;
}

export const AuthButtons = ({ onLoginClick, onSignUpClick }: AuthButtonsProps) => {
  return (
    <>
      {/* Desktop: secondary sign in, primary sign up */}
      <div className="hidden items-center gap-2 md:flex">
        <Button variant="ghost" size="sm" onClick={onLoginClick}>
          Sign in
        </Button>
        <Button variant="primary" size="sm" onClick={onSignUpClick}>
          Sign up
        </Button>
      </div>

      {/* Mobile: sign up lives in the menu */}
      <div className="md:hidden">
        <Button variant="primary" size="sm" onClick={onLoginClick}>
          Sign in
        </Button>
      </div>
    </>
  );
};
