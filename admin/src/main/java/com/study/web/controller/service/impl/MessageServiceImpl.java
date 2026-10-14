package com.study.web.controller.service.impl;

import com.study.web.controller.domin.Message;
import com.study.web.controller.mapper.MessageMapper;
import com.study.web.controller.service.IMessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service("messageService")
public class MessageServiceImpl implements IMessageService {

    @Autowired
    private MessageMapper messageMapper;

    @Override
    public List<Message> selectMessageList(Message message) {
        return messageMapper.selectMessageList(message);
    }

    @Override
    public Message selectMessageById(Long id) {
        return messageMapper.selectMessageById(id);
    }

    @Override
    public int insertMessage(Message message) {
        return messageMapper.insertMessage(message);
    }

    @Override
    public int updateMessage(Message message) {
        return messageMapper.updateMessage(message);
    }

    @Override
    public int deleteMessageById(Long id) {
        return messageMapper.deleteMessageById(id);
    }

    @Override
    public int deleteMessageByIds(String[] ids) {
        return messageMapper.deleteMessageByIds(ids);
    }
}