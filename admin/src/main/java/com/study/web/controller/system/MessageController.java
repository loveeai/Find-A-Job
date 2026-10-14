package com.study.web.controller.system;

import com.study.common.response.ResponseResult;
import com.study.web.controller.BaseController;
import com.study.web.controller.domin.Message;
import com.study.web.controller.service.IMessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class MessageController extends BaseController {

    @Autowired
    private IMessageService messageService;

    @GetMapping("/message")
    public ResponseResult selectMessageList(Message message) {
        startPage();
        List<Message> data = messageService.selectMessageList(message);
        return getResult(data);
    }

    @GetMapping("/message/{id}")
    public ResponseResult selectMessageById(@PathVariable Long id) {
        Message message = messageService.selectMessageById(id);
        return getResult(message);
    }

    @PostMapping("/message")
    public ResponseResult insertMessage(@RequestBody Message message) {
        return getResult(messageService.insertMessage(message));
    }

    @PutMapping("/message")
    public ResponseResult updateMessage(@RequestBody Message message) {
        return getResult(messageService.updateMessage(message));
    }

    @DeleteMapping("/message/{id}")
    public ResponseResult deleteMessageById(@PathVariable Long id) {
        return getResult(messageService.deleteMessageById(id));
    }

    @DeleteMapping("/message/ids/{ids}")
    public ResponseResult deleteMessageByIds(@PathVariable String[] ids) {
        return getResult(messageService.deleteMessageByIds(ids));
    }
}