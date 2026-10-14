package com.study.web.controller.mapper;

import com.study.web.controller.domin.Message;

import java.util.List;

public interface MessageMapper {
    List<Message> selectMessageList(Message message);

    Message selectMessageById(Long id);

    int insertMessage(Message message);

    int updateMessage(Message message);

    int deleteMessageById(Long id);

    int deleteMessageByIds(String[] ids);
}