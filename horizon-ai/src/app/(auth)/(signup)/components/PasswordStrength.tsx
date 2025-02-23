const PasswordStrength: React.FC<{ password: string }> = ({ password }) => {
  const calculateStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/\d/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 1;
    return strength;
  };

  const getStrengthText = (strength: number): string => {
    if (password.length === 0) return '';
    if (strength === 0) return 'Very Weak';
    if (strength === 1) return 'Weak';
    if (strength === 2) return 'Fair';
    if (strength === 3) return 'Good';
    if (strength === 4) return 'Strong';
    return 'Very Strong';
  };

  const getStrengthColor = (strength: number): string => {
    if (password.length === 0) return 'bg-[#AFD3E2]';
    if (strength === 0) return 'bg-red-500';
    if (strength === 1) return 'bg-orange-500';
    if (strength === 2) return 'bg-yellow-500';
    if (strength === 3) return 'bg-blue-500';
    if (strength === 4) return 'bg-green-500';
    return 'bg-green-600';
  };

  const strength = calculateStrength(password);
  const strengthText = getStrengthText(strength);
  const strengthColor = getStrengthColor(strength);

  return (
    <div className="mt-1">
      <div className="flex h-1 w-full space-x-1">
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className={`h-full w-1/5 rounded-full transition-colors duration-300 ${
              index < strength + 1 ? strengthColor : 'bg-[#AFD3E2]/30'
            }`}
          />
        ))}
      </div>
      {password.length > 0 && (
        <div className="mt-2 flex items-center gap-2 text-xs">
          <div className={`h-2 w-2 rounded-full ${strengthColor}`} />
          <span className="text-[#146C94]/70">
            Password Strength: <span className="text-[#146C94]">{strengthText}</span>
          </span>
        </div>
      )}
      {password.length > 0 && (
        <ul className="mt-2 text-xs space-y-1 text-[#146C94]/70">
          <li className={password.length >= 8 ? "text-green-500" : ""}>
            • Minimum 8 characters
          </li>
          <li className={/[A-Z]/.test(password) ? "text-green-500" : ""}>
            • At least one uppercase letter
          </li>
          <li className={/[a-z]/.test(password) ? "text-green-500" : ""}>
            • At least one lowercase letter
          </li>
          <li className={/\d/.test(password) ? "text-green-500" : ""}>
            • At least one number
          </li>
          <li className={/[!@#$%^&*(),.?":{}|<>]/.test(password) ? "text-green-500" : ""}>
            • At least one special character
          </li>
        </ul>
      )}
    </div>
  );
};

export default PasswordStrength;