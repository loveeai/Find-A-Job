package com.study.web.controller.service.impl;

import com.study.web.controller.domin.UserCollectJob;
import com.study.web.controller.mapper.UserCollectJobMapper;
import com.study.web.controller.service.IUserCollectJobService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service("userCollectJobService")
public class UserCollectJobServiceImpl implements IUserCollectJobService {

    @Autowired
    private UserCollectJobMapper userCollectJobMapper;

    @Override
    public List<UserCollectJob> selectUserCollectJobList(UserCollectJob userCollectJob) {
        return userCollectJobMapper.selectUserCollectJobList(userCollectJob);
    }

    @Override
    public UserCollectJob selectUserCollectJobById(Long id) {
        return userCollectJobMapper.selectUserCollectJobById(id);
    }

    @Override
    public int insertUserCollectJob(UserCollectJob userCollectJob) {
        // 检查是否已收藏该职位
        int count = checkUserCollectJob(userCollectJob);
        if (count > 0) {
            // 已收藏，返回0表示未添加新记录
            return 0;
        }
        // 未收藏，添加收藏记录
        return userCollectJobMapper.insertUserCollectJob(userCollectJob);
    }

    @Override
    public int checkUserCollectJob(UserCollectJob userCollectJob) {
        return userCollectJobMapper.checkUserCollectJob(userCollectJob);
    }

    @Override
    public int updateUserCollectJob(UserCollectJob userCollectJob) {
        return userCollectJobMapper.updateUserCollectJob(userCollectJob);
    }

    @Override
    public int deleteUserCollectJobById(Long id) {
        return userCollectJobMapper.deleteUserCollectJobById(id);
    }

    @Override
    public int deleteUserCollectJobByIds(String[] ids) {
        return userCollectJobMapper.deleteUserCollectJobByIds(ids);
    }
}