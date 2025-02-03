import axios from "axios";

export const douyinParse = async (content) => {
    try {
        let url = `https://api.xingzhige.com/API/douyin?url=${content}`
        let res = await axios.get(url)
        return res.data
    } catch (error) {
        throw new Error('解析失败')
    }
}
