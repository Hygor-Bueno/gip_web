import { useState } from 'react'

const useInfractionFields = () => {
  const [fields, setFields] = useState({
    infractionId: "",
    infraction: "",
    gravity: "",
    points: "",
    statusInfractions: "ativo",
  });

  const setField = (name: string, value: string) => {
    setFields(prev => ({ ...prev, [name]: value }));
  };

  const resetFields = () =>
    setFields({
      infractionId: "",
      infraction: "",
      gravity: "",
      points: "",
      statusInfractions: "ativo",
    });

  return {
    ...fields,
    setField,
    resetFields,
  };
};

export default useInfractionFields;