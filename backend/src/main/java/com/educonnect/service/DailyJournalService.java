package com.educonnect.service;

import com.educonnect.entity.Classroom;
import com.educonnect.entity.DailyJournal;
import com.educonnect.entity.User;
import com.educonnect.journal.dto.JournalRequest;
import com.educonnect.journal.dto.JournalResponse;
import com.educonnect.repository.ClassroomRepository;
import com.educonnect.repository.DailyJournalRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DailyJournalService {

    private final DailyJournalRepository dailyJournalRepository;
    private final ClassroomRepository classroomRepository;

    public DailyJournalService(DailyJournalRepository dailyJournalRepository, ClassroomRepository classroomRepository) {
        this.dailyJournalRepository = dailyJournalRepository;
        this.classroomRepository = classroomRepository;
    }

    @Transactional
    @SuppressWarnings("null")
    public DailyJournal createJournal(JournalRequest request, User teacher) {
        Classroom classroom = classroomRepository.findById(request.getClassroomId())
                .orElseThrow(() -> new IllegalArgumentException("Kelas tidak ditemukan."));

        DailyJournal journal = new DailyJournal();
        journal.setClassroom(classroom);
        journal.setTeacher(teacher);
        journal.setDate(request.getDate());
        journal.setTopic(request.getTopic());
        journal.setLearningObjective(request.getLearningObjective());
        journal.setActivities(request.getActivities());
        journal.setEvaluationSummary(request.getEvaluationSummary());

        return dailyJournalRepository.save(journal);
    }

    public List<JournalResponse> getJournalsByClassroom(java.util.UUID classroomId) {
        return dailyJournalRepository.findByClassroomId(classroomId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @SuppressWarnings("null")
    public JournalResponse getJournalDetail(java.util.UUID id) {
        DailyJournal journal = dailyJournalRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Jurnal tidak ditemukan."));
        return mapToResponse(journal);
    }

    private JournalResponse mapToResponse(DailyJournal journal) {
        JournalResponse res = new JournalResponse();
        res.setId(journal.getId());
        res.setClassroomId(journal.getClassroom().getId());
        res.setClassroomName(journal.getClassroom().getGradeClass());
        res.setTeacherId(journal.getTeacher().getId());
        res.setTeacherName(journal.getTeacher().getName());
        res.setDate(journal.getDate());
        res.setTopic(journal.getTopic());
        res.setLearningObjective(journal.getLearningObjective());
        res.setActivities(journal.getActivities());
        res.setEvaluationSummary(journal.getEvaluationSummary());
        return res;
    }
}