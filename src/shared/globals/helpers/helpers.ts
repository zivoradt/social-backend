


export class Helpers{
  static firstLetterUppercase(str: string): string{
    const valueString = str.toLowerCase();
    return valueString
      .split(' ')
      .map((value:string)=> `${value.charAt(0).toUpperCase()}${value.slice(1).toLowerCase()}`)
      .join(' ');
  };

  static toLowerCase(email:string): string{
    return email.toLowerCase();
  };

  static generateRandomIntegers(integerLenght: number): number{
    const characters = '0123456789';
    let result = ' ';
    const charactersLenght = characters.length;
    for (let i = 0; i < integerLenght; i++) {
      result +=characters.charAt(Math.floor(Math.random() * charactersLenght));

    };
    return parseInt(result, 10);
  };
};
