import * as React from 'react';
import { messageHandler } from '@estruyf/vscode/dist/client';
import "./styles.css";
import Layout from './Layout'; // Import the Layout component

export interface IAppProps {}

export const App: React.FunctionComponent<IAppProps> = ({ }: React.PropsWithChildren<IAppProps>) => {
  const [message, setMessage] = React.useState<string>("");
  const [error, setError] = React.useState<string>("");

  const sendMessage = () => {
    messageHandler.send('POST_DATA', { msg: 'Hello from the webview' });
  };

  const requestData = () => {
    messageHandler.request<string>('GET_DATA').then((msg) => {
      setMessage(msg);
    });
  };

  const requestWithErrorData = () => {
    messageHandler.request<string>('GET_DATA_ERROR')
    .then((msg) => {
      setMessage(msg);
    })
    .catch((err) => {
      setError(err);
    });
  };

  return (
    <div className='app'>
      <Layout />
    </div>
  );
};