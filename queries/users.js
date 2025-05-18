import { replaceMongoIdInArray, replaceMongoIdInObject } from "@/lib/convertData";  
import { User } from "@/model/user-model";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/service/mongo";

export async function getUserByEmail(email){
    // Đảm bảo đã kết nối đến MongoDB trước khi truy vấn
    await dbConnect();
    const user = await User.findOne({email: email}).lean();
    return replaceMongoIdInObject(user);
} 

export async function getUserDetails(userId){
    await dbConnect();
    const user = await User.findById(userId).lean();
    return replaceMongoIdInObject(user);
} 

export async function validatePassword(email, password){
    const user = await getUserByEmail(email);
    const isMatch = await bcrypt.compare(
        password,
        user.password
    );
    return isMatch
}

export async function getAllUsers(options = {}) {
    await dbConnect();
    
    const { 
        page = 1, 
        limit = 10, 
        search = "", 
        role = "", 
        sortBy = "createdAt",
        sortOrder = -1 
    } = options;
    
    const skip = (page - 1) * limit;
    
    // Xây dựng query
    let query = {};
    
    // Thêm điều kiện tìm kiếm nếu có
    if (search) {
        query = {
            $or: [
                { firstName: { $regex: search, $options: "i" } },
                { lastName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ],
        };
    }
    
    // Thêm điều kiện lọc theo role nếu có
    if (role) {
        query.role = role;
    }
    
    // Tạo đối tượng sắp xếp
    const sort = {};
    sort[sortBy] = sortOrder;
    
    // Lấy tổng số người dùng phù hợp với điều kiện
    const total = await User.countDocuments(query);
    
    // Lấy danh sách người dùng
    const users = await User.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean();
    
    // Tính toán tổng số trang
    const totalPages = Math.ceil(total / limit);
    
    return {
        users: replaceMongoIdInArray(users),
        page,
        limit,
        total,
        totalPages
    };
}