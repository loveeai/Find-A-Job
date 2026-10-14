package com.study.web.controller.service.impl;

import com.study.web.controller.domin.Complaint;
import com.study.web.controller.mapper.ComplaintMapper;
import com.study.web.controller.service.IComplaintService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service("complaintService")
public class ComplaintServiceImpl implements IComplaintService {

    @Autowired
    private ComplaintMapper complaintMapper;

    @Override
    public List<Complaint> selectComplaintList(Complaint complaint) {
        return complaintMapper.selectComplaintList(complaint);
    }

    @Override
    public Complaint selectComplaintById(Long id) {
        return complaintMapper.selectComplaintById(id);
    }

    @Override
    public int insertComplaint(Complaint complaint) {
        return complaintMapper.insertComplaint(complaint);
    }
}
