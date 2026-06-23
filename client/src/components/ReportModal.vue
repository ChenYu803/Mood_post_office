<template>
  <el-dialog
    v-model="visible"
    title="举报内容"
    width="480px"
    :close-on-click-modal="false"
    class="report-dialog"
    @close="handleClose"
  >
    <div class="report-notice">
      <p>如果你认为该内容违反了社区规范，请填写举报理由。我们将在审核后处理。</p>
    </div>

    <div class="report-form">
      <el-input
        v-model="reason"
        type="textarea"
        :rows="5"
        placeholder="请输入举报理由（仅支持中英文字符及标点符号）"
        :maxlength="200"
        show-word-limit
        @input="validateInput"
      />
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :disabled="!canSubmit" :loading="submitting">
          提交举报
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { api } from '@/stores'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  targetId: { type: String, default: '' },
  targetType: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue', 'submitted'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const reason = ref('')
const submitting = ref(false)

const allowedPattern = /^[\u4e00-\u9fa5a-zA-Z\s，。！？、；：""''（）《》【】…\-\.,\!?\;:\"\'()\[\]\/]*$/

function validateInput() {
  if (!allowedPattern.test(reason.value)) {
    reason.value = reason.value.replace(/[^\u4e00-\u9fa5a-zA-Z\s，。！？、；：""''（）《》【】…\-\.,\!?\;:\"\'()\[\]\/]/g, '')
  }
}

const canSubmit = computed(() => {
  return reason.value.trim().length > 0 && reason.value.trim().length <= 200 && allowedPattern.test(reason.value)
})

async function handleSubmit() {
  if (!canSubmit.value) return
  if (reason.value.length > 200) {
    ElMessage.warning('举报理由不能超过200字')
    return
  }

  submitting.value = true
  try {
    const res = await api.post('/reports', {
      targetId: props.targetId,
      targetType: props.targetType,
      reason: reason.value.trim()
    })
    if (res.data.code === 201) {
      ElMessage.success('举报已提交，我们将尽快审核')
      emit('submitted')
      handleClose()
    } else {
      ElMessage.error(res.data.message || '举报提交失败')
    }
  } catch (e) {
    ElMessage.error(e.response?.data?.message || '举报提交失败')
  } finally {
    submitting.value = false
  }
}

function handleClose() {
  reason.value = ''
  visible.value = false
}
</script>

<style lang="scss">
.report-dialog {
  .el-dialog {
    background: linear-gradient(145deg, #f5ebe0 0%, #ede4d8 100%);
    border-radius: 12px;
    border: 1px solid rgba(212, 165, 116, 0.3);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
  }

  .el-dialog__header {
    border-bottom: 1px solid rgba(139, 115, 85, 0.2);
    padding: 20px 24px;
  }

  .el-dialog__title {
    color: #3d2f24;
    font-weight: 500;
  }

  .el-dialog__body {
    padding: 24px;
  }

  .el-dialog__footer {
    border-top: 1px solid rgba(139, 115, 85, 0.2);
    padding: 16px 24px;
  }
}

.report-notice {
  background: rgba(212, 165, 116, 0.1);
  border: 1px solid rgba(212, 165, 116, 0.2);
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 20px;

  p {
    font-size: 14px;
    color: #6B5A48;
    line-height: 1.6;
    margin: 0;
  }
}

.report-form {
  .el-textarea__inner {
    background: rgba(250, 246, 240, 0.8);
    border-color: rgba(139, 115, 85, 0.2);
    color: #3d2f24;
    font-size: 14px;

    &::placeholder {
      color: #A09890;
    }

    &:focus {
      border-color: var(--color-amber-glow);
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;

  .el-button {
    border-radius: 6px;
  }

  .el-button--primary {
    background: linear-gradient(135deg, var(--color-amber-glow) 0%, var(--color-warm-brown) 100%);
    border-color: var(--color-warm-brown);
    color: #fff;
  }
}
</style>
