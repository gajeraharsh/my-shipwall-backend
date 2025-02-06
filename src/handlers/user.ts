import { Types } from "mongoose"
import User from "../models/User"
import { UserDocument } from "../types/IUser"
import ApiError from "../utils/apiError"

export const generateAccessAndRefereshTokens = async (userId: Types.ObjectId) => {
    try {
        const user = await User.findById(userId) as UserDocument
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}
