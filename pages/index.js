import { useState, useCallback, useEffect } from 'react'

import supabase from '../lib/supabase'

const Home = () => {
	const [messages, setMessages] = useState([])
	const [message, setMessage] = useState('')
	
	const sendMessage = useCallback(async event => {
		event.preventDefault()
		setMessage('')
		
		const { error } = await supabase
			.from('messages')
			.insert({ body: message })
		
		if (!error)
			return
		
		setMessage(message)
		alert(error.message)
	}, [message, setMessage])
	
	const onMessageChange = useCallback(event => {
		setMessage(event.target.value)
	}, [setMessage])
	
	useEffect(() => {
		supabase
			.from('messages')
			.select()
			.then(({ data: newMessages, error }) => {
				if (error)
					return alert(error.message)
				
				setMessages(oldMessages => [
					...newMessages,
					...oldMessages
				])
			})
		
		const subscription = supabase
			.from('messages')
			.on('INSERT', payload => {
				setMessages(messages => [...messages, payload.new])
			})
			.subscribe()
		
		return () => supabase.removeSubscription(subscription)
	}, [setMessages])
	
	return (
		<>
			{messages.map(message => (
				<p key={message.id}>{message.body}</p>
			))}
			<form onSubmit={sendMessage}>
				<input required value={message} onChange={onMessageChange} />
				<button disabled={!message}>Send</button>
			</form>
		</>
	)
}



export default Home
