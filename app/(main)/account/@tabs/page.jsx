import { auth } from "@/auth";
import { getUserByEmail } from "@/queries/users";

async function Profile() {
	const session = await auth(); 
    const loggedInUser = await getUserByEmail(session?.user?.email);

	return (
		<div className="space-y-8">
			{/* Form thông tin cá nhân */}
			<div>
				<h2 className="text-lg font-medium text-slate-900 mb-6">Thông tin cá nhân</h2>
				<form>
					<div className="space-y-6">
						<div className="grid grid-cols-2 gap-4">
							<div>
								<label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-1">Họ <span className="text-red-500">*</span></label>
								<input 
									type="text" 
									id="firstName" 
									name="firstName" 
									defaultValue={loggedInUser?.firstName || "Admin"}
									className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
								/>
							</div>
							<div>
								<label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-1">Tên <span className="text-red-500">*</span></label>
								<input 
									type="text" 
									id="lastName" 
									name="lastName" 
									defaultValue={loggedInUser?.lastName || "System"}
									className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
								/>
							</div>
						</div>
						
						<div className="grid grid-cols-2 gap-4">
							<div>
								<label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email <span className="text-red-500">*</span></label>
								<input 
									type="email" 
									id="email" 
									name="email" 
									defaultValue={loggedInUser?.email || "admin@example.com"}
									readOnly
									className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md cursor-not-allowed"
								/>
								<p className="text-xs text-slate-500 mt-1">Email không thể thay đổi</p>
							</div>
							<div>
								<label htmlFor="designation" className="block text-sm font-medium text-slate-700 mb-1">Nghề nghiệp</label>
								<input 
									type="text" 
									id="designation" 
									name="designation" 
									defaultValue={loggedInUser?.designation || "Senior System Administrator"}
									className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
								/>
							</div>
						</div>
						
						<div>
							<label htmlFor="bio" className="block text-sm font-medium text-slate-700 mb-1">Giới thiệu bản thân</label>
							<textarea 
								id="bio" 
								name="bio" 
								rows="4" 
								defaultValue={loggedInUser?.bio || "Quản trị viên hệ thống với nhiều năm kinh nghiệm trong lĩnh vực giáo dục trực tuyến."}
								className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary resize-none"
							></textarea>
						</div>
						
						<div className="flex justify-end">
							<button 
								type="submit" 
								className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
							>
								Lưu thay đổi
							</button>
						</div>
					</div>
				</form>
			</div>
			
			<hr className="border-slate-200" />
			
			{/* Form liên hệ và đổi mật khẩu */}
			<div className="grid md:grid-cols-2 gap-8">
				<div>
					<h2 className="text-lg font-medium text-slate-900 mb-6">Thông tin liên hệ</h2>
					<form>
						<div className="space-y-4">
							<div>
								<label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">Số điện thoại</label>
								<input 
									type="tel" 
									id="phone" 
									name="phone" 
									placeholder="Nhập số điện thoại của bạn"
									className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
								/>
							</div>
							<div>
								<label htmlFor="website" className="block text-sm font-medium text-slate-700 mb-1">Website</label>
								<input 
									type="url" 
									id="website" 
									name="website" 
									placeholder="https://example.com"
									className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
								/>
							</div>
							<div className="pt-2">
								<button 
									type="submit" 
									className="w-full px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 transition-colors"
								>
									Cập nhật thông tin
								</button>
							</div>
						</div>
					</form>
				</div>
				
				<div>
					<h2 className="text-lg font-medium text-slate-900 mb-6">Đổi mật khẩu</h2>
					<form>
						<div className="space-y-4">
							<div>
								<label htmlFor="current-password" className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu hiện tại</label>
								<input 
									type="password" 
									id="current-password" 
									name="current-password" 
									placeholder="Nhập mật khẩu hiện tại"
									className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
								/>
							</div>
							<div>
								<label htmlFor="new-password" className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu mới</label>
								<input 
									type="password" 
									id="new-password" 
									name="new-password" 
									placeholder="Nhập mật khẩu mới"
									className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
								/>
							</div>
							<div>
								<label htmlFor="confirm-password" className="block text-sm font-medium text-slate-700 mb-1">Nhập lại mật khẩu mới</label>
								<input 
									type="password" 
									id="confirm-password" 
									name="confirm-password" 
									placeholder="Xác nhận mật khẩu mới"
									className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
								/>
							</div>
							<div className="pt-2">
								<button 
									type="submit" 
									className="w-full px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 transition-colors"
								>
									Cập nhật mật khẩu
								</button>
							</div>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}

export default Profile;
