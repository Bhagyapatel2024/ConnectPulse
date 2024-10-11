// import React from 'react'
// import Chat from '../chat/Chat'
// import Detail from '../detail/Detail'

// export default function Hero1() {
//   return (
//     <>
//     <Chat width="90%"/>
//     <Detail width="10%"/>
//     </>
//   )
// }
import React from 'react';
import Chat from '../chat/Chat';
import Detail from '../detail/Detail';
import { useLocation } from 'react-router-dom';

export default function Hero1() {
  const location = useLocation();
  const userDetails = location.state; // Access the passed user details

  return (
    <>
      <Chat width="90%" />
      {/* Pass the fetched user details to Detail component */}
      <Detail width="10%" userDetails={userDetails} />
    </>
  );
}
