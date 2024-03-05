// Import necessary hooks and styled-components for styling
import { useState } from 'react';
import styled from 'styled-components';
import './App.css'; // Importing CSS for global styles


const controller = new AbortController();

// The main functional component for the app
function App() {
  // State hooks for managing user input, conversation history, loading status, and the current answer
  const [input, setInput] = useState('');
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState('');



  // Function to handle the submit action
  const handleSubmit = () => {
    // Add the current question to the conversations list
    setConversations(convs => [...convs, { type: 'question', text: input }]);
    // Set loading state to true
    setIsLoading(true);
    // Reset the current answer
    setCurrentAnswer('');

    // Fetch data from the AI API
    // fetch('http://ai.kerkeb.com/api/generate', {
      fetch('http://127.0.0.1:8070/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      // Sending the user input and additional parameters to the API
      body: JSON.stringify({
        "model": "mistral:instruct",
        "prompt": input,
        "system": "talk to me like a react teacher, use functional components and ES6 syntax, and hooks",
        "stream": true, // Enable streaming mode
      }),
    })
    .then(response => { 
      const reader = response.body.getReader();
      let decoder = new TextDecoder();
      let data = '';
      let tempResponse = ''; // Temporary storage for the response

      // Function to process the text stream
      function processText({ done, value }) {
        if (done) {
          // When done, update the conversation with the full response
          setCurrentAnswer(''); // Reset the current answer
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
               console.log(message)
              if (message.trim()) {
                let json = JSON.parse(message);
                if (json.response) {
                  tempResponse += json.response; // Accumulate the response
                  setCurrentAnswer(tempResponse); // Update the current answer with accumulated response
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
  
  // Render method for the app
  return (
    <Container>
      <ConversationContainer>
        {/* Map through conversations and display them */}
        {conversations.map((conv, index) => (
          <Message key={index} isQuestion={conv.type === 'question'}>
            {conv.text}
          </Message>
        ))}
        {/* Display the current answer if it exists */}
        {currentAnswer && <Message isQuestion={false}>{currentAnswer}</Message>}
      </ConversationContainer>
      {/* Show a loading indicator when isLoading is true */}
      {isLoading && <p>Chargement...</p>}

      <InputContainer>
        <Input 
          onChange={(e) => setInput(e.target.value)} // Update the input state on change
          value={input} // Control the input with React state
          type="text"
        />
        <button onClick={handleSubmit}>Submit</button>
        {isLoading && <button onClick={() => controller.abort()}>Cancel</button> }
      </InputContainer>
    </Container>
  );
}

// Styled-components for styling the app's components
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
