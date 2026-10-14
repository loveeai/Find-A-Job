package com.study.web.controller.mapper;

import com.study.web.controller.domin.Complaint;

import java.util.List;

public interface ComplaintMapper {
    List<Complaint> selectComplaintList(Complaint complaint);

    Complaint selectComplaintById(Long id);

    int insertComplaint(Complaint complaint);
}
