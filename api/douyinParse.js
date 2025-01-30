import axios from "axios";

export const douyinParse = async (content) => {
    try {
        let url = `https://api.tangdouz.com/dy.php?lj=${content}&return=json`
        let res = await axios.get(url)
        return res.data.url
    } catch (error) {
        throw new Error('解析失败')
    }
}
