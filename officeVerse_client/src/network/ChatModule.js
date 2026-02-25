import { VoiceManager } from './VoiceModule.js';

export function initChat(playerId, playerName, roomId, roomDisplayCode) {
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8080';
    const socket = new WebSocket(`${wsUrl}/chat`);

    // UI Elements
    const globalView = document.getElementById('view-global');
    const privateView = document.getElementById('view-private');
    const globalHistory = document.getElementById('history-global');
    const privateHistory = document.getElementById('history-private');

    const voiceManager = new VoiceManager(socket, playerId,
        // onStatusChange
        // onStatusChange
        (status, showHangup) => {
            const time = new Date().toLocaleTimeString();

            // Check if we already have an active call bubble
            const activeBubble = document.querySelector('.active-call-bubble');

            if (showHangup) {
                // If we already have an active bubble, don't create another one
                if (activeBubble) {
                    const textSpan = activeBubble.querySelector('.msg-text-content');
                    if (textSpan) textSpan.textContent = status;
                    return;
                }

                const callId = Date.now();
                const html = `<div class="msg-bubble system active-call-bubble" id="call-status-${callId}">
                    VOICE: <span class="msg-text-content">${status}</span>
                    <button class="call-hangup-btn" data-id="${callId}" style="cursor:pointer; background:#f44336; color:white; border:none; padding:4px 8px; border-radius:4px; margin-left:10px">End Call ❌</button>
                    <span style="font-size:0.8em; color:#888">(${time})</span>
                </div>`;

                if (privateHistory) {
                    privateHistory.insertAdjacentHTML('beforeend', html);
                    privateHistory.scrollTop = privateHistory.scrollHeight;

                    setTimeout(() => {
                        const bubble = document.getElementById(`call-status-${callId}`);
                        if (bubble) {
                            const btnEnd = bubble.querySelector('.call-hangup-btn');
                            if (btnEnd) {
                                btnEnd.onclick = () => {
                                    voiceManager.endCall();
                                    // UI update will happen when onStatusChange is called again with showHangup=false
                                };
                            }
                        }
                    }, 0);
                }
            } else {
                // If pending/ended status
                if (activeBubble) {
                    // Update the existing bubble to show it ended
                    activeBubble.classList.remove('active-call-bubble'); // No longer active
                    activeBubble.innerHTML = `VOICE: ${status} <span style="font-size:0.8em; color:#888">(${time})</span>`;
                } else {
                    // Just a normal status message
                    const html = `<div class="msg-bubble system">VOICE: ${status} <span style="font-size:0.8em; color:#888">(${time})</span></div>`;
                    if (privateHistory) {
                        privateHistory.insertAdjacentHTML('beforeend', html);
                        privateHistory.scrollTop = privateHistory.scrollHeight;
                    }
                }
            }
        },
        // onIncomingCall
        (senderId) => {
            const time = new Date().toLocaleTimeString();
            const callId = Date.now();
            const html = `
                <div class="msg-bubble system" id="call-${callId}">
                    Incoming call from Player ${senderId} <br/>
                    <button class="call-accept-btn" data-id="${callId}" style="cursor:pointer; background:#4CAF50; color:white; border:none; padding:4px 8px; border-radius:4px;">Accept</button>
                    <button class="call-reject-btn" data-id="${callId}" style="cursor:pointer; background:#f44336; color:white; border:none; padding:4px 8px; border-radius:4px; margin-left:5px">Reject</button>
                    <span style="font-size:0.8em; color:#888">(${time})</span>
                </div>`;

            if (privateHistory) {
                privateHistory.insertAdjacentHTML('beforeend', html);
                privateHistory.scrollTop = privateHistory.scrollHeight;

                // Bind events - wait for bubble to be in DOM
                setTimeout(() => {
                    const bubble = document.getElementById(`call-${callId}`);
                    if (bubble) {
                        const btnAccept = bubble.querySelector('.call-accept-btn');
                        const btnReject = bubble.querySelector('.call-reject-btn');

                        btnAccept.onclick = () => {
                            voiceManager.acceptIncomingCall();
                            bubble.innerHTML = `Ongoing call with Player ${senderId}`;
                        };

                        btnReject.onclick = () => {
                            voiceManager.rejectIncomingCall();
                            bubble.innerHTML = `Call rejected.`;
                        };
                    }
                }, 0);
            }
        }
    );

    // EXPOSE GLOBAL FUNCTIONS FOR MEETING
    window.joinMeetingRoom = (roomId) => {
        voiceManager.joinMeeting(roomId);
    };
    window.leaveMeetingRoom = () => {
        voiceManager.leaveMeeting();
    };

    const chatInput = document.getElementById('chat-input-final');
    const activePlayersList = document.getElementById('active-players-list');

    let activeTab = 'global';
    let selectedTargetId = null;
    let playerNamesMap = {}; // Map ID to Name

    const tabs = document.querySelectorAll('.chat-tab');

    // Tab Switching Logic
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active from all
            tabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.chat-view').forEach(v => v.classList.remove('active'));

            // Set active
            tab.classList.add('active');
            tab.classList.remove('unread'); // Clear notifications
            const type = tab.getAttribute('data-tab');
            activeTab = type;
            document.getElementById(`view-${type}`).classList.add('active');

            // Focus input
            setTimeout(() => chatInput.focus(), 100);
        });
    });

    const appendMessage = (historyDiv, text, color) => {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message';
        msgDiv.textContent = text;
        // Note: For bubbles, we use createBubble. This is fallback.
        if (color) msgDiv.style.color = color;
        historyDiv.appendChild(msgDiv);
        historyDiv.scrollTop = historyDiv.scrollHeight;
    };

    const createBubble = (historyDiv, text, type, senderName) => {
        let html = '';
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        if (type === 'system') {
            html = `<div class="msg-bubble system">${text} <span class="msg-timestamp" style="display:inline; margin-left:5px; opacity:0.6; font-size:0.8em">(${timestamp})</span></div>`;
        } else {
            const alignClass = (type === 'sent') ? 'sent' : 'received';
            // Safe encoding for text
            let safeText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");

            // Connect links
            const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
            safeText = safeText.replace(urlRegex, (url) => {
                let href = url;
                if (!href.startsWith('http')) {
                    href = 'http://' + href;
                }
                return `<a href="${href}" target="_blank" style="color: #cceeff; text-decoration: underline; word-break: break-all;">${url}</a>`;
            });
            html = `
                <div class="msg-bubble ${alignClass}">
                    <span class="msg-sender">${senderName}</span>
                    <span class="msg-text">${safeText}</span>
                    <span class="msg-timestamp">${timestamp}</span>
                </div>
            `;
        }
        historyDiv.insertAdjacentHTML('beforeend', html);
        historyDiv.scrollTop = historyDiv.scrollHeight;
    };

    const renderPlayerList = (data) => {
        if (!activePlayersList) return;
        activePlayersList.innerHTML = '';
        if (data.length === 0) {
            activePlayersList.innerHTML = '<div style="padding:10px; color:#666">No one else online</div>';
            return;
        }

        // Parse ID-name pairs from data array [id1, name1, id2, name2...]
        playerNamesMap = {};
        for (let i = 0; i < data.length; i += 2) {
            const id = data[i];
            const name = data[i + 1];
            playerNamesMap[id] = name;
        }

        Object.entries(playerNamesMap).forEach(([id, name]) => {
            if (id == playerId) return; // Don't list self

            const div = document.createElement('div');
            div.className = 'player-item';
            div.dataset.playerId = id; // Store player ID
            if (id == selectedTargetId) div.classList.add('selected');

            // Name
            const nameSpan = document.createElement('span');
            nameSpan.textContent = name;
            div.appendChild(nameSpan);

            // Call Button
            const callBtn = document.createElement('button');
            callBtn.textContent = '📞';
            callBtn.className = 'call-btn';
            callBtn.style.marginLeft = '10px';
            callBtn.style.cursor = 'pointer';
            callBtn.title = 'Call Player';
            callBtn.onclick = (e) => {
                e.stopPropagation();
                voiceManager.startCall(id);
            };
            div.appendChild(callBtn);

            div.addEventListener('click', () => {
                selectPlayer(id, name);
            });
            activePlayersList.appendChild(div);
        });
    };

    const selectPlayer = (id, name) => {
        selectedTargetId = id;
        // Update visuals
        document.querySelectorAll('.player-item').forEach(el => el.classList.remove('selected'));
        const item = document.querySelector(`.player-item[data-playerId="${id}"]`);
        if (item) {
            item.classList.add('selected');
        }

        // Ensure we are on private tab
        if (activeTab !== 'private') {
            const privateTab = document.querySelector('[data-tab="private"]');
            if (privateTab) privateTab.click();
        }

        // System message in Private tab
        createBubble(privateHistory, `Chatting with ${name}`, 'system', 'System');
        chatInput.focus();
    };

    socket.onopen = () => {
        console.log('Chat Connected');
        // Register RoomID, PlayerID and PlayerName
        socket.send(`REGISTER:${roomId}:${playerId}:${playerName}`);
        createBubble(globalHistory, `Connected to ${roomId}`, 'system', 'System');

        // Update Room ID Header
        const roomDisplay = document.getElementById('global-header');
        if (roomDisplay) {
            // Use provided display code or fallback to numeric ID
            const codeToShow = roomDisplayCode || roomId;
            roomDisplay.textContent = `Office Code:\n${codeToShow}`;
            roomDisplay.title = `Full Code: ${codeToShow}`;
        }
    };

    socket.onmessage = (event) => {
        const data = event.data;

        if (data.startsWith("GLOBAL:")) {
            // Extract sender and full message without truncation
            // Format: GLOBAL:senderID:fullMessagePayload
            const firstColon = data.indexOf(':');
            const secondColon = data.indexOf(':', firstColon + 1);
            if (firstColon === -1 || secondColon === -1) return;

            const sender = data.substring(firstColon + 1, secondColon);
            const msg = data.substring(secondColon + 1); // full payload, no truncation

            // --- Boss Task REMOVE (employees only — skip if sender is self) ---
            if (msg.startsWith('BOSS_TASK_REMOVE:')) {
                if (sender == playerId) return; // boss already removed it locally
                // Format: BOSS_TASK_REMOVE:deskId:taskId
                const payload = msg.substring(17);
                const colonIdx = payload.indexOf(':');
                if (colonIdx !== -1) {
                    const deskId = payload.substring(0, colonIdx);
                    const taskId = payload.substring(colonIdx + 1);
                    if (window.handleBossTaskRemoved) window.handleBossTaskRemoved(deskId, taskId);
                }
                return;
            }

            // --- Boss Task ASSIGN (employees only — skip if sender is self) ---
            if (msg.startsWith('BOSS_TASK_ASSIGN:')) {
                if (sender == playerId) return; // boss already added it locally
                // Format: BOSS_TASK_ASSIGN:deskId:taskId:text
                //   deskId='all' => taskId is "d1=111,d2=222,..."
                //   deskId='d1'  => taskId is a single number
                const payload = msg.substring(17); // after 'BOSS_TASK_ASSIGN:'
                const c1 = payload.indexOf(':');
                if (c1 === -1) return;
                const deskId = payload.substring(0, c1);
                const rest = payload.substring(c1 + 1);
                const c2 = rest.indexOf(':');
                if (c2 === -1) return;
                const taskId = rest.substring(0, c2);
                const taskText = rest.substring(c2 + 1);
                if (window.handleBossTaskReceived) window.handleBossTaskReceived(deskId, taskId, taskText);
                return;
            }

            // Bonus Rain Logic
            if (msg === 'BONUS_RAIN') {
                if (window.handleBonusRainReceived) window.handleBonusRainReceived();
                return;
            }

            const senderName = playerNamesMap[sender] || sender;
            const type = (sender == playerId) ? 'sent' : 'received';
            const name = (sender == playerId) ? 'You' : senderName;

            createBubble(globalHistory, msg, type, name);

            // Notification
            if (activeTab !== 'global') {
                const tab = document.querySelector('.chat-tab[data-tab="global"]');
                if (tab) tab.classList.add('unread');
            }

        } else if (data.startsWith("PRIVATE:")) {
            // PRIVATE:SenderID:Msg — extract without truncation
            const firstColon = data.indexOf(':');
            const secondColon = data.indexOf(':', firstColon + 1);
            if (firstColon === -1 || secondColon === -1) return;

            const sender = data.substring(firstColon + 1, secondColon);
            const msg = data.substring(secondColon + 1);

            let displaySender = sender;
            let type = 'received';

            if (sender.startsWith("To ")) {
                displaySender = "You";
                type = 'sent';
            } else {
                displaySender = playerNamesMap[sender] || sender;
            }

            createBubble(privateHistory, msg, type, displaySender);

            // Notification
            if (activeTab !== 'private') {
                const tab = document.querySelector('.chat-tab[data-tab="private"]');
                if (tab) tab.classList.add('unread');
            }


        } else if (data.startsWith("PLAYER_LIST:")) {
            const listStr = data.substring(12); // Remove "PLAYER_LIST:"
            renderPlayerList(listStr ? listStr.split(',') : []);
        } else if (data.startsWith("VOICE_SIGNAL:")) {
            // VOICE_SIGNAL:SenderID:Msg
            const parts = data.split(':', 3);
            // parts[0] is VOICE_SIGNAL
            // parts[1] is SenderID
            // parts[2] is Payload (which is JSON)
            // But we have to be careful about colons in JSON. 
            // The logic in backend ensures it sends VOICE_SIGNAL:SenderID:Payload
            // So we can just take the substring after second colon

            const firstColon = data.indexOf(':');
            const secondColon = data.indexOf(':', firstColon + 1);
            if (secondColon != -1) {
                const senderId = data.substring(firstColon + 1, secondColon);
                const payload = data.substring(secondColon + 1);
                voiceManager.handleSignal(senderId, payload);
            }
        }
    };

    // EXPOSE SEND MESSAGE FOR GOOGLE MEET INTEGRATION
    window.sendGlobalMessage = (text) => {
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(`GLOBAL:${playerId}:${text}`);
            // Only show in chat history for real chat messages, not system messages
            const isSystemMsg = text.startsWith('BOSS_TASK_ASSIGN:') ||
                text.startsWith('BOSS_TASK_REMOVE:') ||
                text === 'BONUS_RAIN';
            if (!isSystemMsg) {
                createBubble(globalHistory, text, 'self', 'Me');
            }
        }
    };


    socket.onclose = () => {
        console.log('Chat Disconnected');
        createBubble(globalHistory, 'Disconnected', 'system', 'System');
    };

    const sendMessage = () => {
        const text = chatInput.value.trim();
        if (text && socket.readyState === WebSocket.OPEN) {
            if (activeTab === 'global') {
                // GLOBAL:MyID:Msg
                socket.send(`GLOBAL:${playerId}:${text}`);
            } else {
                // PRIVATE:MyID:TargetID:Msg
                if (!selectedTargetId) {
                    createBubble(privateHistory, 'Select a player first', 'system', 'System');
                    return;
                }
                socket.send(`PRIVATE:${playerId}:${selectedTargetId}:${text}`);
            }
            chatInput.value = '';
            chatInput.blur(); // Release focus so player can move
        }
    };

    chatInput.addEventListener('keydown', (e) => {
        e.stopPropagation(); // Prevent game inputs
        if (e.key === 'Enter') sendMessage();
    });

    // Also stop propagation on keyup to be safe
    chatInput.addEventListener('keyup', (e) => e.stopPropagation());

    // Stop propagation on paste to ensure game doesn't catch it
    chatInput.addEventListener('paste', (e) => e.stopPropagation());

    // Export function for interaction (E Key)
    window.selectPlayerForChat = function (targetId) {
        // Switch to private tab
        if (activeTab !== 'private') {
            const privateTab = document.querySelector('[data-tab="private"]');
            privateTab.click(); // Trigger the click listener logic
        }

        const targetName = playerNamesMap[targetId] || `Player ${targetId}`;
        selectPlayer(targetId, targetName);
    };
}