import logo from './logo.svg';
import './App.css';
import styled from 'styled-components';
import axios from 'axios';
import { useEffect, useState } from 'react';

function App() {
  const [input, setInput] = useState('');
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState('');

  // const handleSubmit = () => {
  //   const newConversations = [...conversations, { type: 'question', text: input }];
  //   setConversations(newConversations);
  //   setIsLoading(true);
   
  //   fetch('http://ai.kerkeb.com/api/generate', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({
  //       "model": "mistral:instruct",
  //       "prompt": input,
  //       "stream": true, // Activer le mode flux
  //     }),
  //   })
  //   .then(response => {
  //     const reader = response.body.getReader();
  //     let decoder = new TextDecoder();
  //     let data = '';
  
  //     function processText({ done, value }) {
  //       if (done) {

  //         setConversations(convs => [...convs, { type: 'answer', text: currentAnswer}]);
  //         setCurrentAnswer('')
  //         setIsLoading(false);
  //         return;
  //       }
  //       data += decoder.decode(value, { stream: true });
  //       try {
  //         let lastNewlineIndex = data.lastIndexOf('\n');
  //         if (lastNewlineIndex !== -1) {
  //           let messages = data.slice(0, lastNewlineIndex).split('\n');
  //           messages.forEach(message => {
  //             if (message.trim()) {
  //               console.log('message', message);
  //               let json = JSON.parse(message);
  //               if (json.response) {
  //                 // textResponse += json.response;
  //                 setCurrentAnswer(currentAnswer + json.response);
  //                 // setConversations(convs => [...convs, { type: 'answer', text: json.response }]);
  //               }
  //             }
  //           });
  //           data = data.slice(lastNewlineIndex + 1);
  //         }
  //       } catch (error) {
  //         console.error('Error processing JSON', error);
  //       }
  //       reader.read().then(processText).catch(error => {
  //         console.log(error);
  //         setIsLoading(false);
  //       });
  //     }
  
  //     reader.read().then(processText).catch(error => {
  //       console.log(error);
  //       setIsLoading(false);
  //     });
  //   })
  //   .catch(error => {
  //     console.log(error);
  //     setIsLoading(false);
  //   });
  // }
  const handleSubmit = () => {
    // Ajouter la question à la conversation
    setConversations(convs => [...convs, { type: 'question', text: input }]);
    setIsLoading(true);
    setCurrentAnswer(''); // Réinitialiser la réponse courante
  
    fetch('http://ai.kerkeb.com/api/generate', {
      // fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "model": "mistral:instruct",
        "prompt": input,
        "system": "talk to me like a muslim",
        "stream": true, // Activer le mode flux
      }),
    })
    .then(response => {
      const reader = response.body.getReader();
      let decoder = new TextDecoder();
      let data = '';
      let tempResponse = ''; // Accumuler la réponse ici
  
      function processText({ done, value }) {
        if (done) {
          // Ajouter la réponse complète à la conversation
          setCurrentAnswer(''); // Réinitialiser la réponse courante
          
          setConversations(convs => [...convs, { type: 'answer', text: tempResponse }]);
          setIsLoading(false);
          return;
        }
        data += decoder.decode(value, { stream: true });
        try {
          let lastNewlineIndex = data.lastIndexOf('\n');
          if (lastNewlineIndex !== -1) {
            let messages = data.slice(0, lastNewlineIndex).split('\n');
            messages.forEach(message => {
              if (message.trim()) {
                let json = JSON.parse(message);
                if (json.response) {
                  tempResponse += json.response; // Accumuler la réponse
                  setCurrentAnswer(tempResponse); // Mettre à jour la réponse courante
                }
              }
            });
            data = data.slice(lastNewlineIndex + 1);
          }
        } catch (error) {
          console.error('Error processing JSON', error);
        }
        reader.read().then(processText).catch(error => {
          console.log(error);
          setIsLoading(false);
        });
      }
  
      reader.read().then(processText).catch(error => {
        console.log(error);
        setIsLoading(false);
      });
    })
    .catch(error => {
      console.log(error);
      setIsLoading(false);
    });
  }
  
  return (
    <Container>
      <ConversationContainer>
        {conversations.map((conv, index) => (
          <Message key={index} isQuestion={conv.type === 'question'}>
            {conv.text}
          </Message>
        ))}
        {currentAnswer && <Message isQuestion={false}>{currentAnswer}</Message>}
      </ConversationContainer>
      {isLoading && <p>Chargement...</p>}

      <InputContainer>
        <Input 
          onChange={(e) => setInput(e.target.value)}
          value={input}
          type="text"
        />
        <button onClick={handleSubmit}>Submit</button>
      </InputContainer>
    </Container>
  );
}

const Container = styled.div`
  padding: 0px 24px;
`

const InputContainer = styled.div`
  height: 10vh;
  width: 100%;
  display: flex;
`

const ConversationContainer = styled.div`
  width: 100%;
  min-height: 90vh;
  display: flex;
  flex-direction: column;
  background-color: #f0f0f0;
  overflow-y: auto;
  margin-bottom: 10px;
`

const Message = styled.div`
  background-color: ${props => props.isQuestion ? '#add8e6' : '#90ee90'};
  margin: 5px;
  padding: 10px;
  border-radius: 10px;
  align-self: ${props => props.isQuestion ? 'flex-start' : 'flex-end'};
`

const Input = styled.input`
  flex-grow: 1;
  height: 10vh;
  margin-right: 10px;
`

export default App;
