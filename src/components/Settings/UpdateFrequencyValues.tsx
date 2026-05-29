import React from 'react';

type Props = {
  min24Hours?: boolean;
};

const UpdateFrequencyValues = ({ min24Hours }: Props) => (
  <>
    <option value={1}>Never</option>
    {!min24Hours && (
      <>
        <option value={2}>Every 6 Hours</option>
        <option value={3}>Every 12 Hours</option>
      </>
    )}
    <option value={4}>Every 24 Hours</option>
    <option value={5}>Once a Week</option>
    <option value={6}>Once a Month</option>
  </>
);

export default UpdateFrequencyValues;
