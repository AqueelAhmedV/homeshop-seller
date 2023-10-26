export function pinCodeValidator(pin) {
    const pinCodeRegex = /^[0-9]{6}$/;
    return pinCodeRegex.test(pin)
  }