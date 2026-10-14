package com.study.web.controller.service;

import com.study.web.controller.domin.Complaint;

import java.util.List;

public interface IComplaintService {
    List<Complaint> selectComplaintList(Complaint complaint);

    Complaint selectComplaintById(Long id);

    int insertComplaint(Complaint complaint);
}
