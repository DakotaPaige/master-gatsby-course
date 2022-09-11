import { useState } from 'react';

export default function useForm(defaults) {
  const [values, setValues] = useState(defaults);

  function updateValue(e) {
    // Check if its a number and convert
    let { value } = e.target;
    if (e.target.type === 'number') {
      value = parseInt(e.target.value);
    }
    setValues({
      // Copy the existing values into it
      ...values,
      // Update the new value that changed based on the name of the target
      [e.target.name]: value,
    });
  }

  return { values, updateValue };
}
