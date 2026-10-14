package com.study.web.controller.service;

import com.study.web.controller.domin.UserCollectJob;

import java.util.List;

public interface IUserCollectJobService {
    List<UserCollectJob> selectUserCollectJobList(UserCollectJob userCollectJob);

    UserCollectJob selectUserCollectJobById(Long id);

    int insertUserCollectJob(UserCollectJob userCollectJob);

    int updateUserCollectJob(UserCollectJob userCollectJob);

    int deleteUserCollectJobById(Long id);

    int deleteUserCollectJobByIds(String[] ids);
    
    /**
     * 检查用户是否已收藏该职位
     * @param userCollectJob 包含userId和jobId的对象
     * @return 收藏记录数量
     */
    int checkUserCollectJob(UserCollectJob userCollectJob);
}