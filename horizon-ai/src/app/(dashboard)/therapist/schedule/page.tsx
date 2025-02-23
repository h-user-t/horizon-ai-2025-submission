'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Video, Calendar as CalendarIcon, Clock, ArrowRight } from 'lucide-react';
import { auth } from '@/app/utils/firebase/config';
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link';

interface Session {
	id: string;
	sessionDate: Date;
	patientId: string;
	patientName: string;
	type: string;
	status: string;
	time: string;
}

export default function SchedulePage() {
	const [date, setDate] = useState<Date | undefined>(new Date());
	const [filter, setFilter] = useState('all');
	const [sessions, setSessions] = useState<Session[]>([]);

	// Fetch sessions from Firestore
	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			if (user) {
				const db = getFirestore();
				await fetchSessions(user.uid, db);
			} else {
				setSessions([]);
			}
		});

		return () => unsubscribe();
	}, []);

	const fetchSessions = async (therapistId: string, db: any) => {
		try {
			const sessionsRef = collection(db, 'sessions');
			const q = query(sessionsRef, where('therapistId', '==', therapistId));
			const querySnapshot = await getDocs(q);

			const sessionList: Session[] = await Promise.all(
				querySnapshot.docs.map(async (docSnap) => {
					const data = docSnap.data();
					const sessionDate = data.sessionDate.toDate();

					// Fetch patient name
					const patientRef = doc(db, 'users', data.patientId);
					const patientSnap = await getDoc(patientRef);
					const patientData = patientSnap.exists() ? patientSnap.data() : {};
					const patientName =
						patientData.first_name && patientData.last_name ? `${patientData.first_name} ${patientData.last_name}` : 'Unknown Patient';

					return {
						id: docSnap.id,
						sessionDate,
						patientId: data.patientId,
						patientName,
						type: 'Video Session', // Assuming all are video sessions; adjust if there's a field for type
						status: data.status || 'upcoming',
						time: sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
					};
				})
			);

			setSessions(sessionList);
		} catch (error) {
			console.error('Error fetching sessions:', error);
			setSessions([]);
		}
	};

	// Filter appointments based on selected status
	const filteredSessions = sessions.filter((session) => {
		if (filter === 'all') return true;
		return session.status === filter;
	});

	// Get the badge color based on session status
	const getStatusBadge = (status: string) => {
		switch (status) {
			case 'upcoming':
				return 'bg-blue-100 text-blue-800';
			case 'completed':
				return 'bg-green-100 text-green-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	};

	return (
		<div className='p-6 max-w-6xl mx-auto'>
			{/* Header Section */}
			<div className='flex items-center justify-between mb-6'>
				<div>
					<h1 className='text-3xl font-bold text-[#146C94]'>Schedule</h1>
					<p className='text-gray-600 mt-1'>Manage your therapy sessions</p>
				</div>
			</div>

			<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
				{/* Calendar Section */}
				<Card className='lg:col-span-1'>
					<CardHeader>
						<CardTitle className='text-lg font-semibold'>Calendar</CardTitle>
					</CardHeader>
					<CardContent>
						<Calendar mode='single' selected={date} onSelect={setDate} className='rounded-md border' />
					</CardContent>
				</Card>

				{/* Sessions List Section */}
				<Card className='lg:col-span-2'>
					<CardHeader>
						<div className='flex items-center justify-between'>
							<CardTitle className='text-lg font-semibold'>Appointments</CardTitle>
							<Select value={filter} onValueChange={setFilter}>
								<SelectTrigger className='w-32'>
									<SelectValue placeholder='Filter by' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='all'>All Sessions</SelectItem>
									<SelectItem value='upcoming'>Upcoming</SelectItem>
									<SelectItem value='completed'>Completed</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</CardHeader>
					<CardContent>
						<div className='space-y-4'>
							{filteredSessions.map((session) => (
								<div key={session.id} className='flex items-center gap-4 p-4 rounded-lg border hover:shadow-md transition-shadow'>
									<div className='h-12 w-12 rounded-full bg-[#146C94]/10 flex items-center justify-center flex-shrink-0'>
										<Video className='h-6 w-6 text-[#146C94]' /> {/* All sessions are video */}
									</div>

									<div className='flex-1 min-w-0'>
										<div className='flex items-center justify-between'>
											<h3 className='font-medium text-gray-900'>{session.patientName}</h3>
											<Badge variant='secondary' className={getStatusBadge(session.status)}>
												{session.status.charAt(0).toUpperCase() + session.status.slice(1)}
											</Badge>
										</div>

										<div className='mt-1 flex items-center gap-4 text-sm text-gray-500'>
											<div className='flex items-center gap-1'>
												<CalendarIcon className='h-4 w-4' />
												<span>{session.sessionDate.toLocaleDateString()}</span>
											</div>
											<div className='flex items-center gap-1'>
												<Clock className='h-4 w-4' />
												<span>{session.time}</span>
											</div>
											<span className='text-[#146C94]'>{session.type}</span>
										</div>
									</div>

									<Link href={`/rooms/${session!.id}`} className="flex flex-row items-center bg-[#AFD3E2] text-[#146C94] px-5 py-2 rounded-md text-sm font-medium hover:bg-[#146C94] hover:text-[#F6F1F1] transition-all duration-200 shadow-sm hover:shadow-md">
                
                  Join Room
                  <ArrowRight className="h-4 w-4 ml-2" />
                
              </Link>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
