<template>
  <div>
    <!--面包屑导航区-->
    <div class="board">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>

        <el-breadcrumb-item>轮播图管理</el-breadcrumb-item>
        <el-breadcrumb-item>轮播图信息管理</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <el-card class="box-card">
      <el-row :gutter="20" class="row2">

        <el-col :span="5">
          <el-input v-model="selectedNameCn" placeholder="请输入名称" clearable></el-input>
        </el-col>
        <el-col :span="4">
          <el-button icon="el-icon-search" @click="getList">搜索</el-button>
        </el-col>
        <el-col :span="2">
          <el-button type="primary" style="background-color: chocolate;" @click="addDialogVisible = true">添加</el-button>
        </el-col>
        <el-col :span="4">
          <el-button type="danger" @click="multipleDelete">批量删除</el-button>
        </el-col>
      </el-row>

      <!--    列表字段-->
      <el-table :data="volunteerList" style="width: 100%" border stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column type="index" :index="getTableIndex" label=""></el-table-column>
        <el-table-column prop="poster" label="图片">
          <template slot-scope="scope">
            <img :src="'http://127.0.0.1:8182' + JSON.parse(scope.row.posters)" style="width: 200px; height: 200px;">
          </template>
        </el-table-column>
        <!--      操作按钮-->
        <el-table-column label="操作" width="180">
          <template slot-scope="scope">
            <el-tooltip effect="dark" content="修改信息" placement="top" :enterable="false" :open-delay="500">
              <el-button type="primary" style="background-color: chocolate;"  size="mini" @click="showEditDialog(scope.row.id)">修改
              </el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="删除信息" placement="top" :enterable="false" :open-delay="500">
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteMovieById(scope.row.id)">
              </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!--分页区域-->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
        :current-page="queryInfo.pageNum" :page-sizes="[5, 7, 9]" :page-size="queryInfo.pageSize"
        layout="total, sizes, prev, pager, next, jumper" :total="total"></el-pagination>
    </el-card>

    <!--添加对话框-->
    <el-dialog title="添加" :visible.sync="addDialogVisible" width="60%" @close="addDialogClosed">
      <!--内容主题区-->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <!--prop：在addFormRules中定义校验规则， v-model：双向绑定数据-->
        <el-form-item label="图片">
          <el-upload action list-type="picture-card" :auto-upload="false" :limit="1" :file-list="poster"
            :on-exceed="handleExceed" :on-change="handleChangeP" :on-success="handleSuccessP" :on-error="handleError"
            ref="posterRef" :http-request="submitFileP">
            <i slot="default" class="el-icon-plus"></i>
            <div slot="file" slot-scope="{file}">
              <img class="el-upload-list__item-thumbnail" :src="file.url" alt />
              <span class="el-upload-list__item-actions">
                <span class="el-upload-list__item-preview" @click="handlePictureCardPreviewP(file)">
                  <i class="el-icon-zoom-in"></i>
                </span>
                <span v-if="!disabled" class="el-upload-list__item-delete" @click="handleRemoveP(file)">
                  <i class="el-icon-delete"></i>
                </span>
              </span>
            </div>
          </el-upload>
          <el-dialog :visible.sync="dialogVisible">
            <img width="100%" :src="dialogImageUrl" alt />
          </el-dialog>
        </el-form-item>
      </el-form>
      <!--底部区域-->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="add">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改信息对话框 -->
    <el-dialog title="修改信息" :visible.sync="editDialogVisible" width="60%" @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">

        <el-form-item label="图片">
          <el-upload action list-type="picture-card" :auto-upload="false" :limit="1" :file-list="poster"
            :on-exceed="handleExceed" :on-change="handleChangeP" :on-success="handleSuccessP" :on-error="handleError"
            ref="posterEditRef" :http-request="submitFileP">
            <i slot="default" class="el-icon-plus"></i>
            <div slot="file" slot-scope="{file}">
              <img class="el-upload-list__item-thumbnail" :src="file.url" alt />
              <span class="el-upload-list__item-actions">
                <span class="el-upload-list__item-preview" @click="handlePictureCardPreviewP(file)">
                  <i class="el-icon-zoom-in"></i>
                </span>
                <span v-if="!disabled" class="el-upload-list__item-delete" @click="handleRemoveP(file)">
                  <i class="el-icon-delete"></i>
                </span>
              </span>
            </div>
          </el-upload>
          <!--放大预览-->
          <el-dialog :visible.sync="dialogVisible">
            <img width="100%" :src="dialogImageUrl" alt />
          </el-dialog>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editHallInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isList: [{ name: '是' }, { name: '否' }],
      queryInfo: {
        selectedNameCn: "",
        pageNum: 1,
        pageSize: 7,
        startDate: "",
        endDate: ""
      },
      total: 0,
      url: "http://localhost:8182/",
      //控制对话框的显示与隐藏
      addDialogVisible: false,
      selectedDate: [],
      selectedNameCn: "",
      categoryList: [],
      volunteerList: [],
      editForm: {},
      editActorForm: null,
      editCategoryForm: [],
      editDialogVisible: false,
      editActorVisible: false,
      multipleSelection: [],
      dialogVisible: false,
      dialogImageUrl: "",
      disabled: false,
      //封面增删变量
      poster: [],
      //发送给后端的JSON图片
      posterL: [],
      deletePostList: [],
      //添加删除图片集 动态绑定图片列表
      pics: [],
      // 发送给后端的JSON图片数组
      pictureList: [],
      picNums: 0,
      deletePicList: [],
      //添加表单数据
      addForm: {
        posters: "",
      },
      //添加验证表单规则对象
      addFormRules: {
        posters: [{ required: true, message: "请选择图片", trigger: "blur" }],
        isgg: [{ required: true, message: "请选择", trigger: "blur" }],
      },
      //修改验证表单规则对象
      editFormRules: {
        posters: [{ required: true, message: "请选择图片", trigger: "blur" }],
        isgg: [{ required: true, message: "请选择", trigger: "blur" }],

      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    getTableIndex(index) {
      return (Number(this.queryInfo.pageNum || 1) - 1) * Number(this.queryInfo.pageSize || 0) + index + 1;
    },
    getKindIdList() {
      const _this = this;
      axios.get("productKind").then(resp => {
        _this.kindIdList = resp.data.data;
      });
    },
    getList() {
      this.queryInfo.name = this.selectedNameCn;
      if (!this.selectedDate) {
        this.queryInfo.startDate = this.selectedDate[0];
        this.queryInfo.endDate = this.selectedDate[1];
      }
      const _this = this;
      axios.get("carousel", { params: _this.queryInfo }).then(resp => {
        console.log(resp);
        _this.volunteerList = resp.data.data;
        _this.total = resp.data.total;
        _this.queryInfo.pageSize = resp.data.pageSize;
        _this.queryInfo.pageNum = resp.data.pageNum;
      });
    },

    ifShow(id) {
      let i = 0;
      let l = true;
      for (i = 0; i < this.editCategoryForm.length; i++) {
        if (id == this.editCategoryForm[i].movieCategoryId) {
          l = false;
        }
      }
      return l;
    },
    handleSizeChange(newSize) {
      this.queryInfo.pageSize = newSize;
      this.getList();
      console.log(newSize);
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pageNum = newPage;
      this.getList();
      console.log(newPage);
    },
    async submitFile() {
      const _this = this;
      for (let i = 0; i < this.pics.length; i++) {
        let formData = new FormData();
        if (this.pics[i].status === "success") {
          let s = this.pics[i].url;
          this.pictureList.push(s.substring(s.indexOf("/images")));
          continue;
        }
        let file = this.pics[i].raw;
        formData.append("file", file);
        await axios.post("upload/movie", formData).then(response => {
          _this.pictureList.push(response.data.data);
        });
      }
    },
    async submitFileP() {
      const _this = this;
      for (let i = 0; i < this.poster.length; i++) {
        let formData = new FormData();
        if (this.poster[i].status === "success") {
          let s = this.poster[i].url;
          this.posterL.push(s.substring(s.indexOf("/images")));
          continue;
        }
        let file = this.poster[i].raw;
        formData.append("file", file);
        await axios.post("upload/movie", formData).then(response => {
          _this.posterL.push(response.data.data);
        });
      }
    },
    // 监听添加对话框的关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
      // this.$refs.pictureRef.clearFiles();
      this.$refs.posterRef.clearFiles();
      this.poster = [];
      this.posterL = [];
      this.pics = [];
      this.pictureList = [];
    },
    // 监听添加按钮
    async add() {
      await this.submitFile();
      await this.submitFileP();
      this.addForm.userId = JSON.parse(window.sessionStorage.getItem('loginUser')).sysUser.userId;
      this.addForm.posters = JSON.stringify(this.posterL);
      const _this = this;
      this.$refs.addFormRef.validate(async valid => {
        console.log(valid);
        if (!valid) return;
        //预校验成功，发网络请求
        axios.defaults.headers.post["Content-Type"] = "application/json";
        await axios
          .post("carousel", JSON.stringify(_this.addForm))
          .then(resp => {
            console.log(resp);
            if (resp.data.code !== 200) {
              this.$message.error("添加信息失败！");
            }
          });
        //隐藏添加对话框
        this.addDialogVisible = false;
        //重新加载列表
        this.getList();
        this.$message.success("添加信息成功！");
      });
    },
    // 监听修改对话框的关闭事件
    editDialogClosed() {
      this.$refs.editFormRef.resetFields();
      // this.$refs.pictureEditRef.clearFiles();
      this.$refs.posterEditRef.clearFiles();
      this.pics = [];
      this.pictureList = [];
      this.posterL = [];
      this.poster = [];
    },

    // 修改信息对话框
    async editHallInfo() {
      await this.submitFile();
      this.editForm.pictures = JSON.stringify(this.pictureList);
      await this.submitFileP();
      this.editForm.posters = JSON.stringify(this.posterL);
      this.editForm.uuserId = JSON.parse(window.sessionStorage.getItem('loginUser')).sysUser.userId;
      this.$refs.editFormRef.validate(async valid => {
        const _this = this;
        if (!valid) return;
        let success = true;
        axios.defaults.headers.put["Content-Type"] = "application/json";
        await axios
          .put("carousel", JSON.stringify(_this.editForm))
          .then(resp => {
            if (resp.data.code !== 200) {
              this.$message.error("修改信息失败！");
              success = false;
            }
          });
        if (!success) return;
        for (let s of this.deletePicList) {
          await axios.get(
            "/upload/delete?filePath=" + s.substring(s.indexOf("/images"))
          );
        }
        for (let s of this.deletePostList) {
          await axios.get(
            "/upload/delete?filePath=" + s.substring(s.indexOf("/images"))
          );
        }
        this.editDialogVisible = false;
        this.getList();
        this.$message.success("修改信息成功！");
      });
    },
    handleChangeP(file, filelist) {
      this.poster = filelist;
      console.log(this.poster);
    },
    handleSuccessP(response) {
      this.posterL.push(response.data);
      this.addForm = JSON.stringify(this.posterL);
      this.editForm = JSON.stringify(this.posterL);
    },
    handlePictureCardPreviewP(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },
    handleRemoveP(file) {
      const filePath = file.url;
      console.log(filePath);
      const idx = this.poster.findIndex(x => x.url === filePath);
      if (file.status === "success") {
        this.deletePostList.push(file.url);
      }
      this.poster.splice(idx, 1);
    },
    handleError(err) {
      console.log(err);
    },
    // 显示修改对话框，回显数据
    async showEditDialog(id1) {
      console.log(id1)
      const _this = this;
      await axios.get("carousel/" + id1).then(resp => {
        console.log(resp);
        _this.editForm = resp.data.data;
      });
      // for (const item of JSON.parse(this.editForm.moviePictures)) {
      //   let pic = {};
      //   pic["name"] = "";
      //   pic["url"] = this.global.base + item;
      //   this.pics.push(pic);
      // }
      for (const item of JSON.parse(this.editForm.posters)) {
        console.log("1111111111");
        let pic = {};
        pic["name"] = "";
        console.log("item=" + item + "1111111111" + "base=" + this.global.base);
        pic["url"] = this.global.base + item;

        this.poster.push(pic);
      }
      this.editDialogVisible = true;
    },
    // 监听多选框变化
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    // 批量删除
    async multipleDelete() {
      const _this = this;
      if (!this.multipleSelection.length) {
        return _this.$message.info("请先选择要删除的数据");
      }
      //询问用户是否确认删除
      const resp = await this.$confirm(
        "此操作将永久删除这些条目, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);

      // 用户确认删除, resp为字符串"confirm"
      // 用户取消删除，resp为字符串"cancel"
      if (resp == "cancel") {
        return _this.$message.info("已取消删除");
      }

      let ids = [];
      this.multipleSelection.forEach(data => {
        let item = data.id;
        ids.push(item);
      });
      console.log(ids);
      axios.defaults.headers.post["Content-Type"] = "application/json";
      await axios.delete("carousel/" + ids, JSON.stringify(ids)).then(resp => {
        console.log(123);
        if (resp.data.code !== 200) {
          this.$message.success("批量删除失败！");
        }
      });
      this.getList();
      this.$message.success("批量删除成功！");
    },
    // 单个删除
    async deleteMovieById(id1) {
      let deleteInfo = id1;
      const _this = this;
      //询问用户是否确认删除
      const resp = await this.$confirm(
        "此操作将永久删除该条目, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);

      // 用户确认删除, resp为字符串"confirm"
      // 用户取消删除，resp为字符串"cancel"
      console.log(resp);
      if (resp == "cancel") {
        return _this.$message.info("已取消删除");
      }

      console.log(deleteInfo);
      axios.defaults.headers.post["Content-Type"] = "application/json";
      await axios
        .delete("carousel/" + deleteInfo, JSON.stringify(deleteInfo))
        .then(resp => {
          if (resp.data.code !== 200) {
            _this.$message.success("删除信息失败！");
          }
        });
      this.getList();
      this.$message.success("删除信息成功！");
    },
    async deleteCategory(categoryId) {
      console.log("类型id");
      console.log(categoryId);
      const _this = this;
      await axios
        .delete("sysMovieToCategory/" + this.actorMovieId + "/" + categoryId)
        .then(resp => {
          console.log(resp);
          _this.$message.success("删除类型成功");
        });
      await axios.get("sysMovie/find/" + this.actorMovieId).then(response => {
        _this.editCategoryForm = response.data.data.movieCategoryList;
      });
    },
    handleExceed() {
      this.$message.error("封面不能超过一张!");
    },
    async addCategory() {
      const _this = this;
      await axios
        .post(
          "sysMovieToCategory/" +
          this.actorMovieId +
          "/" +
          this.selectedMovieCategory
        )
        .then(resp => {
          console.log(resp);
        });
      axios.get("sysMovie/find/" + this.actorMovieId).then(response => {
        _this.editCategoryForm = response.data.data.movieCategoryList;
      });
    }
  }
};
</script>

<style scoped>
.row2 {
  margin-top: 20px;
}
</style>
