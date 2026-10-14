package com.study.web.controller.service;

import com.study.web.controller.domin.Message;

import java.util.List;

public interface IMessageService {
    List<Message> selectMessageList(Message message);

    Message selectMessageById(Long id);

    int insertMessage(Message message);

    int updateMessage(Message message);

    int deleteMessageById(Long id);

    int deleteMessageByIds(String[] ids);
}