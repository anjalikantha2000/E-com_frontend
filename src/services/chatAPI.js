import axios from "axios"

const API = "http://localhost:5000/api"

export const chatAPI = {

  getOrCreateSession: async (sessionId, userId) => {
    const res = await axios.get(`${API}/chat/session`, {
      params: { sessionId, userId }
    })
    return res.data
  },

  sendMessage: async (sessionId, userId, message) => {
    const res = await axios.post(`${API}/chat/message`, {
      sessionId,
      userId,
      message
    })
    return res.data
  }

}