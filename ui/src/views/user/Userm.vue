<template>
    <div style="box-sizing:border-box">
        <div class="user-info-container">
            <h1>我的个人信息</h1>
            <div style="width: 100%;margin-top:30px;">
                <el-form :model="loginUser" ref="editFormRef" label-width="150px" :label-position="'left'"
                    style="margin-left:50px">
                    <el-form-item label="头像">
                        <el-upload action="" list-type="picture-card" :auto-upload="false" :limit="1" :file-list="pics"
                            :on-change="handleChange" :on-success="handleSuccess" :on-error="handleError"
                            :on-exceed="handleExceed" ref="pictureRef" :http-request="submitFile">
                            <i slot="default" class="el-icon-plus"></i>
                            <div slot="file" slot-scope="{file}">
                                <img class="el-upload-list__item-thumbnail"
                                    :src="(picDialog ? '' : global.base) + file.url" alt="">
                                <span class="el-upload-list__item-actions">
                                    <span class="el-upload-list__item-delete" @click="handleRemove(file)">
                                        <i class="el-icon-delete"></i>
                                    </span>
                                </span>
                            </div>
                        </el-upload>
                    </el-form-item>
                    <el-form-item label="昵称" prop="userName">
                        <el-input v-model="loginUser.userName" disabled></el-input>
                    </el-form-item>
                    <el-form-item label="密码" prop="password">
                        <el-input v-model="loginUser.password" type="password" show-password clearable></el-input>
                    </el-form-item>
                    <el-form-item label="邮箱" prop="email">
                        <el-input v-model="loginUser.email"></el-input>
                    </el-form-item>
                    <el-form-item label="手机号" prop="phoneNumber">
                        <el-input v-model="loginUser.phoneNumber"></el-input>
                    </el-form-item>
                    <el-form-item label="性别" prop="sex">
                        <el-radio v-model="loginUser.sex" :label="true">男</el-radio>
                        <el-radio v-model="loginUser.sex" :label="false">女</el-radio>
                    </el-form-item>
                    <el-button type="primary" @click="editUser"
                        style="width:120px;background-color:chocolate ;border:#00cc7e" >保存</el-button>
                </el-form>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "personal",
    data() {
        return {
            addForm:{},
            ordersId: '',
            userId: 0,
            user: {},
            picDialog: false,
            loginUser: {},
            pics: [],
            pictureList: [],
            picSrc: "",
            deletePicList: [],
        }
    },
    methods: {
        normalizePictureList(value) {
            if (!value) {
                return []
            }
            if (Array.isArray(value)) {
                return value.filter(Boolean)
            }
            if (typeof value === 'string') {
                const text = value.trim()
                if (!text) {
                    return []
                }
                if (text.startsWith('[') || text.startsWith('{')) {
                    try {
                        const parsed = JSON.parse(text)
                        if (Array.isArray(parsed)) {
                            return parsed.filter(Boolean)
                        }
                        if (parsed && typeof parsed === 'object') {
                            return [parsed.url || parsed.path || parsed.src].filter(Boolean)
                        }
                    } catch (error) {
                        return [text]
                    }
                }
                return [text]
            }
            if (typeof value === 'object') {
                return [value.url || value.path || value.src].filter(Boolean)
            }
            return []
        },
        async getUser() {
            const { data: res } = await axios.get('sysUser/' + JSON.parse(window.sessionStorage.getItem('loginUser')).sysUser.userId)
            console.log(res)
            this.loginUser = res.data
            const pictureList = this.normalizePictureList(this.loginUser.userPicture)
            this.pics = pictureList.map(item => ({
                name: 'picture',
                url: item.startsWith('http') ? item : item,
                status: 'success'
            }))
        },
        async handleSuccess(response, file, fileList) {
            this.pics = fileList
            console.log(this.pics)
            await this.submitFile()
            this.picSrc = this.pictureList[0]
        },
        handleError(err) {
            console.log(err)
        },
        handleChange(file, filelist) {
            this.pics = filelist.slice(0)
            console.log(111)
            console.log(this.pics)
            this.picDialog = true
        },
        handleRemove(file) {
            const filePath = file.url
            console.log(filePath)
            const idx = this.pics.findIndex(x => x.url === filePath)
            if (file.status === 'success') {
                this.deletePicList.push(file.url)
            }
            this.pics.splice(idx, 1)
        },
        async editUser() {
            await this.submitFile()
            this.loginUser.userPicture = this.pictureList.length ? JSON.stringify(this.pictureList) : ''
            const _this = this
            let success = true
            axios.defaults.headers.put['Content-Type'] = 'application/json'
            await axios.put('sysUser', JSON.stringify(this.loginUser)).then(resp => {
                if (resp.data.code !== 200) {
                    this.$message.error('修改用户信息失败！')
                    success = false
                }
            })
            if (!success) return
            this.$message.success('修改用户信息成功!')
            this.pics = []
            this.pictureList = []
            this.getUser()
            this.picDialog = false
        },
        async submitFile() {
            const _this = this
            this.pictureList = []
            for (let i = 0; i < this.pics.length; i++) {
                let formData = new FormData()
                if (this.pics[i].status === 'success') {
                    let s = this.pics[i].url
                    this.pictureList.push(s.substring(s.indexOf('/images')))
                    continue
                }
                let file = this.pics[i].raw
                formData.append('file', file)
                await axios.post('upload/user', formData).then(response => {
                    console.log(response)
                    _this.pictureList.push(response.data.data)
                })
            }
        },
        handleExceed() {
            this.$message.error("用户头像最多上传一张！")
        },
    },
    created() {
        this.getUser()
    }
}
</script>

<style scoped>
.user-info-container {
    background-color: white;
    padding: 50px
}
</style>
