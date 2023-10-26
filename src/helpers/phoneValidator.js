export function phoneValidator(phone) {
    const phoneNumberRegex = /^[0-9]{10}$/;
    return phoneNumberRegex.test(phone)
  }