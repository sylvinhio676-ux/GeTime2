import React from 'react';

export default function SubjectListSimple() {
  const subjects = [{ id: 1, subject_name: 'Test' }];

  return (
    <div>
      <table>
        <tbody>
          {subjects.map((subject) => {
            return (
              <tr key={subject.id}>
                <td>{subject.subject_name}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}