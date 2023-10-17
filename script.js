const { createApp } = Vue;

const app = createApp({
	data() {
		return {
			description: '',
			offer: '',
			answer: '',
			connected: null,
			pc: null,
			remoteStream: null,
			localStream: null,
			eleAudio: null,

			hasGeneratedOffer: false,
			hasGeneratedAnswer: false,
		};
	},
	methods: {
		async init() {
			this.pc = new RTCPeerConnection({
				iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
			});

			this.remoteStream = new MediaStream();
			this.eleAudio = new Audio();
			this.eleAudio.autoplay = true;
			this.eleAudio.srcObject = this.remoteStream;

			this.localStream = await navigator.mediaDevices.getUserMedia({
				audio: true,
				video: false,
			});
			this.localStream.getTracks().forEach(track => {
				this.pc.addTrack(track, this.localStream);
			});
			// this.localStream.enabled = this.isMicEnabled;
			this.localStream.enabled = true;

			this.pc.onicecandidate = ev => {
				console.log(ev.candidate);
			};

			this.pc.onicegatheringstatechange = ev => {
				if (ev.target.iceGatheringState === 'complete') {
					console.log(console.log('gathering completed'));
					if (this.hasGeneratedOffer) {
						this.offer = btoa(JSON.stringify(this.pc.localDescription));
						navigator.clipboard.writeText(this.offer);
					} else {
						this.answer = btoa(JSON.stringify(this.pc.localDescription));
						navigator.clipboard.writeText(this.offer);
					}
				}
			};

			this.pc.ontrack = ev => {
				console.log('----------------------ontrack-------------------');
				ev.streams[0].getTracks().forEach(track => {
					this.remoteStream.addTrack(track);
					console.log(track);
				});
			};
		},

		async generateOffer() {
			await this.init();
			this.hasGeneratedOffer = true;
			const offer = await this.pc.createOffer();
			this.pc.setLocalDescription(offer);
		},

		async generateAnswer() {
			await this.init();
			this.hasGeneratedAnswer = true;
			await this.pc.setRemoteDescription(JSON.parse(atob(this.offer)));

			const answer = await this.pc.createAnswer();
			await this.pc.setLocalDescription(answer);
			this.connected = true;
		},

		async insertAnswer() {
			await this.pc.setRemoteDescription(JSON.parse(atob(this.answer)));
			this.connected = true;
		},
	},
}).mount('#app');
