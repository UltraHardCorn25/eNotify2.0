import React, { useRef } from "react";
import { db } from "../../../lib/firebase";
import { collection, addDoc } from "firebase/firestore";

type Data = {
  Class: string;
  Email: string;
  Name: string;
  Role: string;
  UserID: string;
};

function InsertOne({ Successful }) {
  const Ime = useRef<HTMLInputElement>(null);
  const Prezime = useRef<HTMLInputElement>(null);
  const StudentClass = useRef<HTMLInputElement>(null);

  const generatePassword = (length: number) => {
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let password = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    return password;
  };

  async function createUser() {
    if (Ime.current && Prezime.current && StudentClass.current) {
      const dataToInsert: Data = {
        Class: StudentClass.current.value,
        Email: Ime.current.value + Prezime.current.value + "@gmail.com",
        Name: `${Ime.current.value} ${Prezime.current.value}`,
        Role: "Student",
        UserID: generatePassword(7),
      };
      await addDoc(collection(db, "Users"), dataToInsert);
    }
  }
  function emptyInsert() {
    if (Ime.current && Prezime.current && StudentClass.current) {
      Ime.current.value = "";
      Prezime.current.value = "";
      StudentClass.current.value = "";
    }
  }

  return (
    <div className="formaContainer">
      <div className="forma">
        <span className="inputContainer">
          <label htmlFor="inputField">Ime učenika</label>
          <input ref={Ime} type="text" placeholder="Luka " />
        </span>
        <span className="inputContainer">
          <label htmlFor="inputField">Prezime učenika</label>
          <input ref={Prezime} type="text" placeholder="Jovanović" />
        </span>
        <span className="inputContainer">
          <label htmlFor="inputField">Razred učenika</label>
          <input ref={StudentClass} type="text" placeholder="3ITS" />
        </span>
        <div className="razredi-options"></div>

        <button
          type="submit"
          className="submit-btn"
          onClick={() => {
            createUser();
            emptyInsert();
            Successful("Korisnik je dodat!");
          }}
        >
          Unesi
        </button>
      </div>
    </div>
  );
}

export default InsertOne;
