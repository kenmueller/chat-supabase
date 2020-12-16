import { useRef, useState, useCallback, useEffect } from 'react'
import Head from 'next/head'

import supabase from '../lib/supabase'

import styles from '../styles/Home.module.scss'

const Home = () => {
	const messagesRef = useRef()
	const inputRef = useRef()
	
	const [messages, setMessages] = useState([])
	const [message, setMessage] = useState('')
	
	const sendMessage = useCallback(async event => {
		event.preventDefault()
		
		setMessage('')
		inputRef.current?.focus()
		
		const { error } = await supabase
			.from('messages')
			.insert({ body: message })
		
		if (!error)
			return
		
		setMessage(message)
		alert(error.message)
	}, [inputRef, message, setMessage])
	
	const onMessageChange = useCallback(event => {
		setMessage(event.target.value)
	}, [setMessage])
	
	useEffect(() => {
		inputRef.current?.focus()
	}, [inputRef])
	
	useEffect(() => {
		const element = messagesRef.current
		
		if (element)
			element.scrollTop = element.scrollHeight
	}, [messagesRef, messages])
	
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
		<div className={styles.root}>
			<Head>
				<title key="title">chat</title>
			</Head>
			<div ref={messagesRef} className={styles.messages}>
				{messages.map(message => (
					<p key={message.id} className={styles.message}>
						{message.body}
					</p>
				))}
			</div>
			<form className={styles.form} onSubmit={sendMessage}>
				<input
					ref={inputRef}
					className={styles.input}
					required
					placeholder="enter your message"
					value={message}
					onChange={onMessageChange}
				/>
				<button className={styles.button} disabled={!message}>
					send
				</button>
			</form>
		</div>
	)
}



export default Home
